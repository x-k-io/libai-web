<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#409EFF"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">100</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#67C23A"><UserFilled /></el-icon>
            <div class="stat-info">
              <div class="stat-value">20</div>
              <div class="stat-label">角色总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#E6A23C"><Lock /></el-icon>
            <div class="stat-info">
              <div class="stat-value">150</div>
              <div class="stat-label">权限总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#F56C6C"><Odometer /></el-icon>
            <div class="stat-info">
              <div class="stat-value">1000</div>
              <div class="stat-label">访问量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="welcome-card" style="margin-top: 20px">
      <h2>欢迎使用 LibAI 后台管理系统</h2>
      <p>这是一个基于 Vue 3 + Element Plus 开发的后台管理系统。</p>
      <p>系统提供了用户管理、角色管理、权限管理等功能模块。</p>
    </el-card>
  </div>
</template>

<script setup>
defineOptions({ name: 'Dashboard' })
</script>

<style scoped lang="scss">
.dashboard {
  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 20px;
      
      .stat-icon {
        font-size: 48px;
      }
      
      .stat-info {
        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #303133;
        }
        
        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-top: 5px;
        }
      }
    }
  }
  
  .welcome-card {
    h2 {
      margin-bottom: 15px;
      color: #303133;
    }
    
    p {
      margin: 8px 0;
      color: #606266;
      line-height: 1.6;
    }
  }
}
</style>
