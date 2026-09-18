import request from '@/utils/request'

// 获取所有权限
export function getAllPermissions() {
  return request({
    url: '/permissions/list',
    method: 'get'
  })
}

// 获取权限详情
export function getPermissionById(id) {
  return request({
    url: `/permissions/${id}`,
    method: 'get'
  })
}

// 创建权限
export function createPermission(data) {
  return request({
    url: '/permissions/create',
    method: 'post',
    data
  })
}

// 更新权限
export function updatePermission(data) {
  return request({
    url: '/permissions/update',
    method: 'put',
    data
  })
}

// 删除权限
export function deletePermission(id) {
  return request({
    url: `/permissions/${id}`,
    method: 'delete'
  })
}
