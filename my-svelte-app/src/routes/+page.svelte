<script>
  import { onMount } from 'svelte'
  export let data

  let currentUser = null
  let random50Stores = []
  let loading50 = false
  let trackingRecordsMap = new Map()
  let expandedTrackings = new Map()

  // 页面加载时自动获取随机店铺
  onMount(() => {
    getRandom50Stores()
  })

  // 选择用户
  function selectUser(user) {
    currentUser = user
  }

  // 获取50个随机店铺
  async function getRandom50Stores() {
    loading50 = true
    try {
      const res = await fetch('/api/stores?action=random50')
      if (res.ok) {
        const stores = await res.json()
        random50Stores = stores
        
        // 获取所有店铺的追踪记录
        await fetchTrackingRecords(stores.map(store => store.phone))
      }
    } catch (error) {
      console.error('获取店铺失败:', error)
    } finally {
      loading50 = false
    }
  }
  
  // 获取多个店铺的追踪记录
  async function fetchTrackingRecords(phones) {
    try {
      const records = []
      for (const phone of phones) {
        const res = await fetch(`/api/tracking?phone=${encodeURIComponent(phone)}`)
        if (res.ok) {
          const phoneRecords = await res.json()
          records.push(...phoneRecords)
        }
      }
      
      // 按电话号码分组
      const newMap = new Map()
      records.forEach(record => {
        if (!newMap.has(record.phone)) {
          newMap.set(record.phone, [])
        }
        newMap.get(record.phone).push(record)
      })
      
      // 对每个电话号码的记录按时间倒序排序
      newMap.forEach((records, phone) => {
        records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      })
      
      // 强制触发重新渲染
      trackingRecordsMap = newMap
    } catch (error) {
      console.error('获取追踪记录失败:', error)
    }
  }

  // 备用复制方法
  function fallbackCopyTextToClipboard(text, button, originalStyle) {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      const successful = document.execCommand('copy')
      if (successful && button && originalStyle) {
        // 复制成功，改变按钮样式
        button.style.backgroundColor = '#4CAF50'
        button.style.color = '#fff'
        button.style.borderColor = '#4CAF50'
        // 1秒后恢复原始样式
        setTimeout(() => {
          button.style.backgroundColor = originalStyle.backgroundColor
          button.style.color = originalStyle.color
          button.style.borderColor = originalStyle.borderColor
        }, 1000)
      } else if (!successful) {
        console.error('复制失败，请手动复制')
      }
    } catch (err) {
      console.error('备用方法复制失败:', err)
    }
    
    document.body.removeChild(textArea)
  }

  // 复制店铺电话
  function copyStorePhone(phone, event) {
    if (phone && event) {
      const button = event.currentTarget
      // 保存原始样式
      const originalStyle = {
        backgroundColor: button.style.backgroundColor,
        color: button.style.color,
        borderColor: button.style.borderColor
      }
      
      // 尝试使用 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(phone)
          .then(() => {
            // 复制成功，改变按钮样式
            button.style.backgroundColor = '#4CAF50'
            button.style.color = '#fff'
            button.style.borderColor = '#4CAF50'
            // 1秒后恢复原始样式
            setTimeout(() => {
              button.style.backgroundColor = originalStyle.backgroundColor
              button.style.color = originalStyle.color
              button.style.borderColor = originalStyle.borderColor
            }, 1000)
          })
          .catch(err => {
            console.error('Clipboard API 失败:', err)
            // 备用方法
            fallbackCopyTextToClipboard(phone, button, originalStyle)
          })
      } else {
        // 备用方法
        fallbackCopyTextToClipboard(phone, button, originalStyle)
      }
    }
  }

  // 切换追踪记录展开状态
  function toggleTracking(phone) {
    const newMap = new Map(expandedTrackings)
    newMap.set(phone, !newMap.get(phone))
    expandedTrackings = newMap
  }
  
  // 计算时间差，返回"xxx分钟前"格式
  function getTimeAgo(dateString) {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return '刚刚'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}小时前`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days}天前`
    }
  }

  // 标记店铺
  async function markStore(phone, trackingResult, event) {
    console.log('开始标记店铺:', { phone, trackingResult, currentUser })
    if (currentUser && phone) {
      try {
        console.log('发送标记请求...')
        const markRes = await fetch('/api/tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phone.toString(),
            userId: parseInt(currentUser.id),
            isAdded: trackingResult === 1,
            isValid: trackingResult === 1,
            trackingResult: parseInt(trackingResult)
          })
        })
        
        console.log('标记请求响应状态:', markRes.status)
        if (markRes.ok) {
          const markData = await markRes.json()
          console.log('标记成功响应:', markData)
          
          // 重新获取该店铺的追踪记录
          console.log('重新获取追踪记录...')
          const trackRes = await fetch(`/api/tracking?phone=${encodeURIComponent(phone)}`)
          console.log('追踪记录请求响应状态:', trackRes.status)
          if (trackRes.ok) {
            const records = await trackRes.json()
            console.log('获取到的追踪记录:', records)
            records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            
            // 强制触发重新渲染
            const newMap = new Map(trackingRecordsMap)
            newMap.set(phone, records)
            trackingRecordsMap = newMap
            
            console.log('状态更新完成:', trackingRecordsMap.get(phone))
          } else {
            const trackError = await trackRes.json()
            console.error('获取追踪记录失败:', trackError)
          }
        } else {
          const errorData = await markRes.json()
          console.error('标记失败:', errorData)
        }
      } catch (error) {
        console.error('标记失败:', error)
      }
    } else if (event) {
      // 未选择用户时，给按钮添加视觉反馈
      const button = event.currentTarget
      const originalStyle = {
        backgroundColor: button.style.backgroundColor,
        color: button.style.color,
        borderColor: button.style.borderColor
      }
      
      // 按钮变红，表示需要先选择用户
      button.style.backgroundColor = '#f44336'
      button.style.color = '#fff'
      button.style.borderColor = '#f44336'
      
      // 1秒后恢复原始样式
      setTimeout(() => {
        button.style.backgroundColor = originalStyle.backgroundColor
        button.style.color = originalStyle.color
        button.style.borderColor = originalStyle.borderColor
      }, 1000)
      
      console.warn('请先选择用户')
    }
  }
</script>

<!-- 导航链接 -->
<nav>
  <a href="/">首页</a>
  <a href="/users">用户页</a>
  <a href="/stores">店铺页</a>
</nav>

<h1>随机店铺</h1>

<!-- 用户选择 -->
<h2>选择用户</h2>
<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
  {#each data.users as user}
    <button 
      style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;"
      on:click={() => selectUser(user)}
    >
      {user.username}
    </button>
  {/each}
</div>

{#if currentUser}
  <p>当前用户：<strong>{currentUser.username}</strong></p>
{/if}

<!-- 页面加载时自动获取随机店铺 -->
{#if loading50}
  <div style="padding: 10px 20px; border: 1px solid #007bff; border-radius: 4px; background-color: #e3f2fd; color: #007bff; font-size: 16px; display: inline-block;">
    加载中...
  </div>
{/if}

<!-- 随机50个店铺列表 -->
{#if random50Stores.length > 0}
  <div style="margin-top: 30px; border: 1px solid #ddd; border-radius: 8px; padding: 20px; max-width: 600px;">
    <h3>随机50个店铺</h3>
    <div style="margin-bottom: 20px;">
      {#each random50Stores as store}
        <div style="padding: 15px; border: 1px solid {trackingRecordsMap.get(store.phone)?.length > 0 ? '#eee' : '#4CAF50'}; border-radius: 4px; background-color: #f9f9f9; margin-bottom: 10px;">
          <!-- 用户操作记录 -->
          {#if trackingRecordsMap.get(store.phone)?.length > 0 && trackingRecordsMap.get(store.phone)[0]}
            <div style="font-size: 14px; margin-bottom: 5px;">
              <span style="{trackingRecordsMap.get(store.phone)[0].trackingResult === 1 ? 'color: #4CAF50; font-weight: bold;' : 'color: #f44336; font-weight: bold;'}">
                {data.users.find(u => u.id === trackingRecordsMap.get(store.phone)[0].userId)?.username}
              </span>
              <span style="font-size: 12px; color: #999; margin-left: 10px;">
                {getTimeAgo(trackingRecordsMap.get(store.phone)[0].createdAt)}
              </span>
            </div>
          {/if}
          
          <div style="font-size: 18px;"><strong>{store.name}</strong></div>
          <div style="font-size: 16px; color: #666; margin: 5px 0;">
            {store.address}。{store.phone}
          </div>
          <div style="margin-top: 10px;">
            <!-- 箭头和按钮同一排 -->
            <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 10px; gap: 10px;">
              <!-- 左侧箭头 -->
              {#if trackingRecordsMap.get(store.phone)?.length > 0}
                <div style="margin-right: auto; font-size: 12px; color: #666; cursor: pointer; padding: 8px; background-color: #f0f0f0; border-radius: 4px;" on:click={() => toggleTracking(store.phone)}>
                  {expandedTrackings.get(store.phone) ? '∨' : '›'}
                </div>
              {/if}
              
              <!-- 按钮区域 -->
              <div style="display: flex; gap: 10px; align-items: center;">
                <button 
                  style="padding: 5px 10px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 12px;"
                  on:click={(e) => { e.stopPropagation(); markStore(store.phone, 1, e); }}
                >
                  👍
                </button>
                <button 
                  style="padding: 5px 10px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 12px;"
                  on:click={(e) => { e.stopPropagation(); markStore(store.phone, 2, e); }}
                >
                  👎
                </button>
                <button 
                  style="padding: 5px 10px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 12px;"
                  on:click={(e) => { e.stopPropagation(); copyStorePhone(store.phone, e); }}
                >
                  复制
                </button>
              </div>
            </div>
            
            <!-- 追踪记录单独一行 -->
            {#if expandedTrackings.get(store.phone) && trackingRecordsMap.get(store.phone)?.length > 0}
              <div style="margin-top: 5px; padding: 12px; background-color: #f9f9f9; border-radius: 4px;">
                {#each trackingRecordsMap.get(store.phone) as record}
                  <div style="font-size: 13px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
                    <span>{#if record.trackingResult === 1}
                      <span style="color: #4CAF50; font-weight: bold;">{data.users.find(u => u.id === record.userId)?.username}</span>
                    {:else if record.trackingResult === 2}
                      <span style="color: #f44336; font-weight: bold;">{data.users.find(u => u.id === record.userId)?.username}</span>
                    {/if}</span>
                    <span>{#if record.trackingResult === 1}
                      <span style="color: #666;">👍</span>
                    {:else if record.trackingResult === 2}
                      <span style="color: #666;">👎</span>
                    {/if}</span>
                    <span style="font-size: 11px; color: #666;">{new Date(record.createdAt).toLocaleString()}</span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
        {/each}
    </div>
  </div>
{:else if !loading50}
  <p style="margin-top: 20px;">点击上方按钮获取随机店铺</p>
{/if}
