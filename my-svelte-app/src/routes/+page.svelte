<script>
  import { onMount } from 'svelte'
  export let data

  let currentUser = null
  let currentPhone = null
  let currentStores = []
  let copyButtonText = '复制电话'
  let addedButtonText = '已添加'
  let invalidButtonText = '号码无效'
  let trackingRecords = []

  // 选择用户
  function selectUser(user) {
    currentUser = user
  }

  // 获取店铺的追踪记录
  async function getTrackingRecords(phone) {
    try {
      const res = await fetch(`/api/tracking?phone=${encodeURIComponent(phone)}`)
      if (res.ok) {
        let records = await res.json()
        // 按时间倒序排序
        records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        trackingRecords = records
      }
    } catch (error) {
      console.error('获取追踪记录失败:', error)
    }
  }

  // 随机获取一个电话号码
  async function getRandomStore() {
    try {
      const res = await fetch('/api/stores')
      if (res.ok) {
        const stores = await res.json()
        if (stores.length > 0) {
          // 获取所有唯一的电话号码
          const uniquePhones = [...new Set(stores.map(store => store.phone))]
          // 随机选择一个电话号码
          const randomPhone = uniquePhones[Math.floor(Math.random() * uniquePhones.length)]
          currentPhone = randomPhone
          // 获取该电话号码对应的所有店铺
          currentStores = stores.filter(store => store.phone === randomPhone)
          // 获取该电话号码的追踪记录
          await getTrackingRecords(randomPhone)
        }
      }
    } catch (error) {
      console.error('获取店铺失败:', error)
    }
  }

  // 复制电话号码
  function copyPhone() {
    if (currentPhone) {
      // 尝试使用 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(currentPhone)
          .then(() => {
            // 更新按钮文本
            copyButtonText = '已完成'
            // 2秒后恢复原始文本
            setTimeout(() => {
              copyButtonText = '复制电话'
            }, 2000)
          })
          .catch(err => {
            console.error('Clipboard API 失败:', err)
            // 备用方法
            fallbackCopyTextToClipboard(currentPhone)
          })
      } else {
        // 备用方法
        fallbackCopyTextToClipboard(currentPhone)
      }
    } else {
      alert('请先加载店铺信息')
    }
  }

  // 备用复制方法
  function fallbackCopyTextToClipboard(text) {
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
      if (successful) {
        // 更新按钮文本
        copyButtonText = '已完成'
        // 2秒后恢复原始文本
        setTimeout(() => {
          copyButtonText = '复制电话'
        }, 2000)
      } else {
        alert('复制失败，请手动复制')
      }
    } catch (err) {
      console.error('备用方法复制失败:', err)
      alert('复制失败，请手动复制')
    }
    
    document.body.removeChild(textArea)
  }

  // 标记为已添加
  async function markAsAdded() {
    if (currentPhone && currentUser) {
      try {
        const res = await fetch('/api/tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: currentPhone,
            userId: currentUser.id,
            isAdded: true,
            isValid: true
          })
        })
        if (res.ok) {
          // 更新按钮文本
          addedButtonText = '已完成'
          // 2秒后恢复原始文本
          setTimeout(() => {
            addedButtonText = '已添加'
          }, 2000)
          // 重新获取追踪记录
          await getTrackingRecords(currentPhone)
        }
      } catch (error) {
        console.error('标记失败:', error)
      }
    }
  }

  // 标记为无效
  async function markAsInvalid() {
    if (currentPhone && currentUser) {
      try {
        const res = await fetch('/api/tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: currentPhone,
            userId: currentUser.id,
            isAdded: false,
            isValid: false
          })
        })
        if (res.ok) {
          // 更新按钮文本
          invalidButtonText = '已完成'
          // 2秒后恢复原始文本
          setTimeout(() => {
            invalidButtonText = '号码无效'
          }, 2000)
          // 重新获取追踪记录
          await getTrackingRecords(currentPhone)
        }
      } catch (error) {
        console.error('标记失败:', error)
      }
    }
  }

  // 初始化：获取一个随机店铺（在客户端挂载后执行）
  onMount(() => {
    getRandomStore()
  })
</script>

<!-- 导航链接 -->
<nav>
  <a href="/">首页</a>
  <a href="/users">用户页</a>
  <a href="/stores">店铺页</a>
</nav>

<h1>首页</h1>

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

<!-- 店铺信息和追踪记录 -->
<h2>店铺信息</h2>
{#if currentPhone}
  <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; max-width: 600px;">
    <!-- 电话号码和操作按钮 -->
    <div>
      <h3>电话号码：{currentPhone}</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
        <button 
          style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;"
          on:click={copyPhone}
        >
          {copyButtonText}
        </button>
        <button 
          style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;"
          on:click={getRandomStore}
        >
          下一个店铺
        </button>
        <button 
          style="padding: 8px 12px; border: 1px solid #4CAF50; border-radius: 4px; cursor: pointer; background-color: #f0fff0;"
          on:click={markAsAdded}
        >
          {addedButtonText}
        </button>
        <button 
          style="padding: 8px 12px; border: 1px solid #f44336; border-radius: 4px; cursor: pointer; background-color: #fff0f0;"
          on:click={markAsInvalid}
        >
          {invalidButtonText}
        </button>
      </div>
    </div>

    <!-- 店铺列表 -->
    <div style="margin-top: 20px;">
      <h3>该号码对应的店铺（{currentStores.length}家）</h3>
      {#each currentStores as store}
        <div style="margin-bottom: 10px; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">
          <strong>{store.name}</strong>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">{store.address}</p>
        </div>
      {/each}
    </div>

    <!-- 追踪记录 -->
    <div style="margin-top: 20px;">
      <h3>扫客记录</h3>
      {#if trackingRecords.length > 0}
        <ul style="list-style-type: none; padding: 0;">
          {#each trackingRecords as record}
            <li style="margin-bottom: 8px; padding: 8px; background-color: #f9f9f9; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong>{data.users.find(u => u.id === record.userId)?.username}</strong>
                <span style="margin-left: 15px;">{record.isAdded ? '已添加' : '未添加'}</span>
                <span style="margin-left: 15px;">{record.isValid ? '有效' : '无效'}</span>
              </div>
              <div style="font-size: 12px; color: #666;">
                {new Date(record.createdAt).toLocaleString()}
              </div>
            </li>
          {/each}
        </ul>
      {:else}
        <p>暂无扫客记录</p>
      {/if}
    </div>
  </div>
{:else}
  <p>加载中...</p>
{/if}