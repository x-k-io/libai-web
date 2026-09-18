import request from '@/utils/request'

// 分页获取用户列表
export function getUserList(params) {
  return request({
    url: '/users/pageGet',
    method: 'get',
    params
  })
}

// 获取用户详情
export function getUserById(id) {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
}

// 创建用户
export function createUser(data) {
  return request({
    url: '/users/create',
    method: 'post',
    data
  })
}

// 更新用户
export function updateUser(data) {
  return request({
    url: '/users/update',
    method: 'put',
    data
  })
}

// 重置密码
export function resetPassword(id) {
  return request({
    url: `/users/${id}/resetPassword`,
    method: 'put'
  })
}

// 更新密码
export function updatePassword(data) {
  return request({
    url: '/users/updatePassword',
    method: 'put',
    data
  })
}

// 更新用户状态
export function updateUserStatus(data) {
  return request({
    url: '/users/updateStatus',
    method: 'put',
    data
  })
}

// 获取用户权限
export function getUserPermissions(id) {
  return request({
    url: `/users/${id}/permissions`,
    method: 'get'
  })
}

// 获取用户角色
export function getUserRoles(id) {
  return request({
    url: `/users/${id}/roles`,
    method: 'get'
  })
}

// 更新用户角色
export function updateUserRole(data) {
  return request({
    url: '/users/updateAccountRole',
    method: 'put',
    data
  })
}
