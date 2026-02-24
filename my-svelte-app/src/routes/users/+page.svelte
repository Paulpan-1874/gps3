<script>
  export let data

  let username = ''
  let isSubmitting = false
  let message = ''
  let messageType = ''

  // 显示消息
  function showMessage(text, type = 'success') {
    message = text
    messageType = type
    setTimeout(() => {
      message = ''
      messageType = ''
    }, 3000)
  }

  // 提交表单新增用户
  async function handleSubmit() {
    if (!username.trim()) {
      showMessage('请输入用户名称', 'error')
      return
    }

    isSubmitting = true
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })

      if (res.ok) {
        // 新增成功，刷新页面更新列表
        showMessage('用户添加成功！')
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        const errorData = await res.json()
        showMessage(errorData.error || '添加失败', 'error')
      }
    } catch (error) {
      showMessage('网络错误，请稍后重试', 'error')
    } finally {
      isSubmitting = false
    }
  }
</script>

<!-- 导航链接 -->
<nav>
  <a href="/">首页</a>
  <a href="/users">用户页</a>
  <a href="/stores">店铺页</a>
</nav>

<h1>用户页</h1>

<!-- 消息提示 -->
{#if message}
  <div style="padding: 10px; margin-bottom: 15px; border-radius: 4px; {messageType === 'error' ? 'background-color: #ffebee; color: #c62828;' : 'background-color: #e8f5e8; color: #2e7d32;'} ">
    {message}
  </div>
{/if}

<!-- 添加用户输入框 -->
<form on:submit|preventDefault={handleSubmit} style="margin-bottom: 20px;">
  <div style="display: flex; gap: 10px; align-items: center;">
    <input 
      type="text" 
      bind:value={username} 
      placeholder="用户名称" 
      required 
      style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; flex: 1;" 
      disabled={isSubmitting}
    />
    <button 
      type="submit" 
      disabled={isSubmitting} 
      style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background-color: #f0f0f0; cursor: pointer;"
    >
      {isSubmitting ? '保存中...' : '保存'}
    </button>
  </div>
</form>

<!-- 用户列表 -->
<h2>用户列表</h2>
{#if data.users.length > 0}
  <ul style="list-style-type: none; padding: 0;">
    {#each data.users as user}
      <li style="padding: 8px; border-bottom: 1px solid #eee;">{user.username}</li>
    {/each}
  </ul>
{:else}
  <p>暂无用户，请添加</p>
{/if}