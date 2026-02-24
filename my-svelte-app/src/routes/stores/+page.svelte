<script>
  export let data

  let name = ''
  let phone = ''
  let address = ''
  let batchData = ''

  // 计算预计添加的数量
  function getExpectedCount() {
    if (!batchData) return 0
    
    const lines = batchData.trim().split('\n')
    let count = 0

    // 跳过表头，从第二行开始解析
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line) {
        // 按制表符分割字段
        const [storeName, storePhone, storeAddress] = line.split('\t').map(field => field.trim())
        if (storeName && storePhone && storeAddress) {
          count++
        }
      }
    }

    return count
  }

  // 提交表单新增店铺
  async function handleSubmit() {
    const res = await fetch('/api/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, address })
    })

    if (res.ok) {
      // 新增成功，刷新页面更新列表
      window.location.reload()
    }
  }

  // 批量导入店铺
  async function handleBatchImport() {
    // 解析批量数据
    const lines = batchData.trim().split('\n')
    const stores = []

    // 跳过表头，从第二行开始解析
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line) {
        // 按制表符分割字段
        const [storeName, storePhone, storeAddress] = line.split('\t').map(field => field.trim())
        if (storeName && storePhone && storeAddress) {
          stores.push({ name: storeName, phone: storePhone, address: storeAddress })
        }
      }
    }

    if (stores.length > 0) {
      // 提交批量数据
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stores)
      })

      if (res.ok) {
        // 导入成功，刷新页面更新列表
        window.location.reload()
      }
    }
  }
</script>

<!-- 导航链接 -->
<nav>
  <a href="/">首页</a>
  <a href="/users">用户页</a>
  <a href="/stores">店铺页</a>
</nav>

<h1>店铺管理</h1>

<!-- 新增店铺表单 -->
<form on:submit|preventDefault={handleSubmit}>
  <h2>单个新增</h2>
  <input type="text" bind:value={name} placeholder="店铺名称" required />
  <input type="text" bind:value={phone} placeholder="电话" required />
  <textarea bind:value={address} placeholder="地址" rows="3" required></textarea>
  <button type="submit">新增店铺</button>
</form>

<!-- 批量导入表单 -->
<form on:submit|preventDefault={handleBatchImport}>
  <h2>批量导入</h2>
  <p>请按以下格式粘贴店铺信息（制表符分隔）：</p>
  <pre>名称	电话	地址</pre>
  <textarea bind:value={batchData} placeholder="例如：
煲珠公·老红糖珍珠奶茶(领展·珠江新城店)	19120105227	广东省广州市天河区马场路36号天河领展广场B101室
喜茶(广州长兴路优托邦店)	19124167381	广东省广州市天河区长兴路13号1-3层自编号B-125A-1号" rows="10"></textarea>
  <div style="display: flex; align-items: center; gap: 10px;">
    <button type="submit">批量导入</button>
    <div>
      预计添加: {getExpectedCount()} 个 | 现有: {data.stores.length} 个
    </div>
  </div>
</form>

<!-- 店铺列表 -->
<h2>店铺列表</h2>
<ul>
  {#each data.stores as store}
    <li>
      <strong>{store.name}</strong><br>
      电话: {store.phone}<br>
      地址: {store.address}
    </li>
  {/each}
</ul>