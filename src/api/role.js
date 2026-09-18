import request from '@/utils/request'

// 分页获取角色列表
export function getRoleList(params) {
  return request({
    url: '/roles/pageGet',
    method: 'get',
    params
  })
}

// 获取所有角色
export function getAllRoles() {
  return request({
    url: '/roles/list',
    method: 'get'
  })
}

// 获取角色详情
export function getRoleById(id) {
  return request({
    url: `/roles/${id}`,
    method: 'get'
  })
}

// 创建角色
export function createRole(data) {
  return request({
    url: '/roles/create',
    method: 'post',
    data
  })
}

// 更新角色
export function updateRole(data) {
  return request({
    url: '/roles/update',
    method: 'put',
    data
  })
}

// 删除角色
export function deleteRole(id) {
  return request({
    url: `/roles/${id}`,
    method: 'delete'
  })
}

// 获取角色权限
export function getRolePermissions(id) {
  return request({
    url: `/roles/${id}/permissions`,
    method: 'get'
  })
}

// 更新角色权限
export function updateRolePermission(data) {
  return request({
    url: '/roles/updateRolePermission',
    method: 'put',
    data
  })
}
