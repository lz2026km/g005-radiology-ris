// @ts-nocheck
import React, { useState } from 'react';

interface LogEntry {
  id: number;
  time: string;
  user: string;
  dept: string;
  action: string;
  target: string;
  result: string;
  ip: string;
}

const mockLogs: LogEntry[] = [
  { id: 1, time: '2026-05-02 08:03:00', user: '刘芳', dept: 'MRI室', action: 'MRI增强', target: '患者董洁 女 70岁 检查号MRI20260500001 骨盆X线', result: '成功', ip: '192.168.1.102' },
  { id: 2, time: '2026-05-02 08:06:00', user: '刘芳', dept: 'X线室', action: 'CT增强', target: '患者张伟 女 57岁 检查号CT20260500002 骨盆X线', result: '成功', ip: '192.168.1.104' },
  { id: 3, time: '2026-05-02 08:09:00', user: '李明辉', dept: 'X线室', action: 'DICOM浏览', target: '患者林峰 女 81岁 检查号XR20260500003 颅脑CT平扫', result: '成功', ip: '192.168.1.102' },
  { id: 4, time: '2026-05-02 08:12:00', user: '王建军', dept: 'X线室', action: '会诊申请', target: '患者钱琳 女 69岁 检查号XR20260500004 颅脑CT平扫', result: '成功', ip: '192.168.1.110' },
  { id: 5, time: '2026-05-02 08:15:00', user: '陈晓东', dept: '放射科', action: '危急值通知', target: '患者赵敏 男 36岁 检查号XR20260500005 腰椎MRI平扫', result: '成功', ip: '192.168.1.103' },
  { id: 6, time: '2026-05-02 08:18:00', user: '吴昊', dept: 'MRI室', action: '胶片打印', target: '患者韩冰 女 56岁 检查号XR20260500006 骨盆X线', result: '成功', ip: '192.168.1.109' },
  { id: 7, time: '2026-05-02 08:21:00', user: '陈晓东', dept: 'CT室', action: 'X线检查', target: '患者沈晨 男 23岁 检查号XR20260500007 颅脑CT平扫', result: '成功', ip: '192.168.1.115' },
  { id: 8, time: '2026-05-02 08:24:00', user: '李明辉', dept: '导管室', action: '报告审核', target: '患者周涛 男 46岁 检查号XR20260500008 胸部X线', result: '成功', ip: '192.168.1.112' },
  { id: 9, time: '2026-05-02 08:27:00', user: '李明辉', dept: 'MRI室', action: '危急值通知', target: '患者龚凯 女 85岁 检查号XR20260500009 肺动脉CTA', result: '成功', ip: '192.168.1.111' },
  { id: 10, time: '2026-05-02 08:30:00', user: '赵强', dept: '登记处', action: '设备预约', target: '患者李娜 男 79岁 检查号XR20260500010 冠脉CTA', result: '成功', ip: '192.168.1.108' },
  { id: 11, time: '2026-05-02 08:33:00', user: '赵强', dept: 'CT室', action: 'DICOM浏览', target: '患者吴静 女 68岁 检查号XR20260500011 冠脉CTA', result: '成功', ip: '192.168.1.106' },
  { id: 12, time: '2026-05-02 08:36:00', user: '张丽华', dept: 'MRI室', action: 'MRI增强', target: '患者许超 女 40岁 检查号MRI20260500012 乳腺钼靶', result: '成功', ip: '192.168.1.113' },
  { id: 13, time: '2026-05-02 08:39:00', user: '王建军', dept: '登记处', action: '会诊申请', target: '患者胡霞 女 67岁 检查号XR20260500013 胸部CT平扫', result: '成功', ip: '192.168.1.106' },
  { id: 14, time: '2026-05-02 08:42:00', user: '吴昊', dept: '放射科', action: 'MRI增强', target: '患者吴静 男 72岁 检查号MRI20260500014 胸部X线', result: '成功', ip: '192.168.1.112' },
  { id: 15, time: '2026-05-02 08:45:00', user: '周敏', dept: 'MRI室', action: 'MRI检查', target: '患者周涛 男 54岁 检查号MRI20260500015 胸部X线', result: '成功', ip: '192.168.1.112' },
  { id: 16, time: '2026-05-02 08:48:00', user: '张丽华', dept: 'CT室', action: '设备预约', target: '患者张伟 女 26岁 检查号XR20260500016 冠脉CTA', result: '成功', ip: '192.168.1.105' },
  { id: 17, time: '2026-05-02 08:51:00', user: '李明辉', dept: 'MRI室', action: 'MRI增强', target: '患者郑强 男 37岁 检查号MRI20260500017 乳腺钼靶', result: '成功', ip: '192.168.1.102' },
  { id: 18, time: '2026-05-02 08:54:00', user: '陈晓东', dept: 'MRI室', action: '设备预约', target: '患者林峰 男 79岁 检查号XR20260500018 乳腺钼靶', result: '成功', ip: '192.168.1.115' },
  { id: 19, time: '2026-05-02 08:57:00', user: '郑杰', dept: 'X线室', action: '危急值通知', target: '患者董洁 女 21岁 检查号XR20260500019 肺动脉CTA', result: '成功', ip: '192.168.1.118' },
  { id: 20, time: '2026-05-02 09:00:00', user: '周敏', dept: '导管室', action: '危急值通知', target: '患者沈晨 男 23岁 检查号XR20260500020 胸部CT平扫', result: '成功', ip: '192.168.1.113' },
  { id: 21, time: '2026-05-02 09:03:00', user: '李明辉', dept: '导管室', action: '危急值通知', target: '患者赵敏 女 30岁 检查号XR20260500021 冠脉CTA', result: '成功', ip: '192.168.1.102' },
  { id: 22, time: '2026-05-02 09:06:00', user: '刘芳', dept: '放射科', action: 'X线检查', target: '患者沈晨 女 61岁 检查号XR20260500022 颅脑CT平扫', result: '成功', ip: '192.168.1.113' },
  { id: 23, time: '2026-05-02 09:09:00', user: '张丽华', dept: '导管室', action: 'MRI检查', target: '患者沈晨 男 44岁 检查号MRI20260500023 乳腺钼靶', result: '成功', ip: '192.168.1.101' },
  { id: 24, time: '2026-05-02 09:12:00', user: '陈晓东', dept: 'X线室', action: 'DICOM浏览', target: '患者蒋伟 女 25岁 检查号XR20260500024 颈椎MRI增强', result: '失败', ip: '192.168.1.107' },
  { id: 25, time: '2026-05-02 09:15:00', user: '张丽华', dept: '登记处', action: '报告审核', target: '患者王磊 男 78岁 检查号XR20260500025 胸部X线', result: '成功', ip: '192.168.1.119' },
  { id: 26, time: '2026-05-02 09:18:00', user: '赵强', dept: '放射科', action: '报告书写', target: '患者郑强 女 51岁 检查号XR20260500026 腹部CT增强', result: '成功', ip: '192.168.1.111' },
  { id: 27, time: '2026-05-02 09:21:00', user: '李明辉', dept: '导管室', action: 'CT检查', target: '患者蒋伟 女 76岁 检查号CT20260500027 腹部CT增强', result: '成功', ip: '192.168.1.105' },
  { id: 28, time: '2026-05-02 09:24:00', user: '陈晓东', dept: 'MRI室', action: '会诊申请', target: '患者周涛 男 33岁 检查号XR20260500028 肺动脉CTA', result: '成功', ip: '192.168.1.110' },
  { id: 29, time: '2026-05-02 09:27:00', user: '刘芳', dept: '导管室', action: '会诊申请', target: '患者王磊 男 25岁 检查号XR20260500029 腰椎MRI平扫', result: '成功', ip: '192.168.1.102' },
  { id: 30, time: '2026-05-02 09:30:00', user: '周敏', dept: '登记处', action: '报告审核', target: '患者吴静 女 20岁 检查号XR20260500030 腹部CT增强', result: '成功', ip: '192.168.1.102' },
  { id: 31, time: '2026-05-02 09:33:00', user: '郑杰', dept: 'MRI室', action: 'X线检查', target: '患者张伟 男 20岁 检查号XR20260500031 腰椎MRI平扫', result: '成功', ip: '192.168.1.101' },
  { id: 32, time: '2026-05-02 09:36:00', user: '刘芳', dept: 'MRI室', action: 'X线检查', target: '患者韩冰 女 40岁 检查号XR20260500032 颈椎MRI增强', result: '成功', ip: '192.168.1.100' },
  { id: 33, time: '2026-05-02 09:39:00', user: '吴昊', dept: '放射科', action: '胶片打印', target: '患者沈晨 男 65岁 检查号XR20260500033 骨盆X线', result: '成功', ip: '192.168.1.108' },
  { id: 34, time: '2026-05-02 09:42:00', user: '李明辉', dept: '导管室', action: 'MRI检查', target: '患者沈晨 男 61岁 检查号MRI20260500034 胸部X线', result: '成功', ip: '192.168.1.105' },
  { id: 35, time: '2026-05-02 09:45:00', user: '孙伟', dept: 'MRI室', action: '报告书写', target: '患者胡霞 男 19岁 检查号XR20260500035 乳腺钼靶', result: '成功', ip: '192.168.1.110' },
  { id: 36, time: '2026-05-02 09:48:00', user: '李明辉', dept: '登记处', action: 'CT增强', target: '患者董洁 男 41岁 检查号CT20260500036 颅脑CT平扫', result: '失败', ip: '192.168.1.111' },
  { id: 37, time: '2026-05-02 09:51:00', user: '吴昊', dept: 'CT室', action: 'CT检查', target: '患者许超 男 56岁 检查号CT20260500037 腹部CT增强', result: '成功', ip: '192.168.1.114' },
  { id: 38, time: '2026-05-02 09:54:00', user: '孙伟', dept: '放射科', action: '危急值通知', target: '患者周涛 女 24岁 检查号XR20260500038 颈椎MRI增强', result: '成功', ip: '192.168.1.102' },
  { id: 39, time: '2026-05-02 09:57:00', user: '周敏', dept: 'X线室', action: '胶片打印', target: '患者张伟 男 54岁 检查号XR20260500039 冠脉CTA', result: '成功', ip: '192.168.1.111' },
  { id: 40, time: '2026-05-02 10:00:00', user: '李明辉', dept: '导管室', action: '报告审核', target: '患者王磊 女 72岁 检查号XR20260500040 胸部X线', result: '成功', ip: '192.168.1.118' },
  { id: 41, time: '2026-05-02 10:03:00', user: '郑杰', dept: 'X线室', action: '报告审核', target: '患者谢娟 女 61岁 检查号XR20260500041 腰椎MRI平扫', result: '成功', ip: '192.168.1.120' },
  { id: 42, time: '2026-05-02 10:06:00', user: '孙伟', dept: 'MRI室', action: 'CT检查', target: '患者马超 男 21岁 检查号CT20260500042 腹部CT增强', result: '成功', ip: '192.168.1.104' },
  { id: 43, time: '2026-05-02 10:09:00', user: '李明辉', dept: '导管室', action: '胶片打印', target: '患者蒋伟 女 63岁 检查号XR20260500043 颅脑CT平扫', result: '成功', ip: '192.168.1.102' },
  { id: 44, time: '2026-05-02 10:12:00', user: '李明辉', dept: 'MRI室', action: 'CT检查', target: '患者张伟 女 76岁 检查号CT20260500044 颈椎MRI增强', result: '成功', ip: '192.168.1.111' },
  { id: 45, time: '2026-05-02 10:15:00', user: '陈晓东', dept: 'X线室', action: '报告书写', target: '患者郑强 男 54岁 检查号XR20260500045 骨盆X线', result: '成功', ip: '192.168.1.114' },
  { id: 46, time: '2026-05-02 10:18:00', user: '孙伟', dept: '登记处', action: 'DICOM浏览', target: '患者胡霞 女 58岁 检查号XR20260500046 胸部X线', result: '失败', ip: '192.168.1.114' },
  { id: 47, time: '2026-05-02 10:21:00', user: '刘芳', dept: '登记处', action: '报告书写', target: '患者赵敏 男 48岁 检查号XR20260500047 腰椎MRI平扫', result: '失败', ip: '192.168.1.116' },
  { id: 48, time: '2026-05-02 10:24:00', user: '吴昊', dept: 'CT室', action: '会诊申请', target: '患者李娜 男 27岁 检查号XR20260500048 腹部CT增强', result: '成功', ip: '192.168.1.113' },
  { id: 49, time: '2026-05-02 10:27:00', user: '赵强', dept: 'MRI室', action: 'CT增强', target: '患者沈晨 男 75岁 检查号CT20260500049 颈椎MRI增强', result: '成功', ip: '192.168.1.120' },
  { id: 50, time: '2026-05-02 10:30:00', user: '郑杰', dept: 'MRI室', action: '设备预约', target: '患者钱琳 男 53岁 检查号XR20260500050 腰椎MRI平扫', result: '失败', ip: '192.168.1.104' },
  { id: 51, time: '2026-05-02 10:33:00', user: '陈晓东', dept: '登记处', action: '危急值通知', target: '患者韩冰 男 61岁 检查号XR20260500051 肺动脉CTA', result: '成功', ip: '192.168.1.120' },
  { id: 52, time: '2026-05-02 10:36:00', user: '吴昊', dept: 'CT室', action: '设备预约', target: '患者韩冰 男 70岁 检查号XR20260500052 肺动脉CTA', result: '成功', ip: '192.168.1.103' },
  { id: 53, time: '2026-05-02 10:39:00', user: '李明辉', dept: 'X线室', action: 'CT增强', target: '患者李娜 女 31岁 检查号CT20260500053 腰椎MRI平扫', result: '成功', ip: '192.168.1.118' },
  { id: 54, time: '2026-05-02 10:42:00', user: '张丽华', dept: 'X线室', action: '设备预约', target: '患者赵敏 男 51岁 检查号XR20260500054 颅脑CT平扫', result: '成功', ip: '192.168.1.101' },
  { id: 55, time: '2026-05-02 10:45:00', user: '王建军', dept: 'MRI室', action: 'CT检查', target: '患者郑强 男 29岁 检查号CT20260500055 冠脉CTA', result: '成功', ip: '192.168.1.107' },
  { id: 56, time: '2026-05-02 10:48:00', user: '陈晓东', dept: 'MRI室', action: '胶片打印', target: '患者曾琳 男 29岁 检查号XR20260500056 冠脉CTA', result: '成功', ip: '192.168.1.104' },
  { id: 57, time: '2026-05-02 10:51:00', user: '刘芳', dept: '放射科', action: '会诊申请', target: '患者谢娟 男 80岁 检查号XR20260500057 肺动脉CTA', result: '成功', ip: '192.168.1.113' },
  { id: 58, time: '2026-05-02 10:54:00', user: '张丽华', dept: 'MRI室', action: '设备预约', target: '患者董洁 男 51岁 检查号XR20260500058 腰椎MRI平扫', result: '成功', ip: '192.168.1.106' },
  { id: 59, time: '2026-05-02 10:57:00', user: '王建军', dept: 'X线室', action: 'CT检查', target: '患者王磊 女 49岁 检查号CT20260500059 肺动脉CTA', result: '成功', ip: '192.168.1.113' },
  { id: 60, time: '2026-05-02 11:00:00', user: '王建军', dept: 'X线室', action: 'X线检查', target: '患者李娜 男 38岁 检查号XR20260500060 颈椎MRI增强', result: '成功', ip: '192.168.1.110' },
  { id: 61, time: '2026-05-02 11:03:00', user: '孙伟', dept: 'X线室', action: 'DICOM浏览', target: '患者王磊 女 33岁 检查号XR20260500061 腰椎MRI平扫', result: '成功', ip: '192.168.1.104' },
  { id: 62, time: '2026-05-02 11:06:00', user: '郑杰', dept: '登记处', action: '设备预约', target: '患者龚凯 男 73岁 检查号XR20260500062 肺动脉CTA', result: '成功', ip: '192.168.1.105' },
  { id: 63, time: '2026-05-02 11:09:00', user: '郑杰', dept: 'CT室', action: 'X线检查', target: '患者赵敏 女 72岁 检查号XR20260500063 腹部CT增强', result: '成功', ip: '192.168.1.108' },
  { id: 64, time: '2026-05-02 11:12:00', user: '周敏', dept: 'CT室', action: '胶片打印', target: '患者王磊 男 76岁 检查号XR20260500064 胸部X线', result: '成功', ip: '192.168.1.102' },
  { id: 65, time: '2026-05-02 11:15:00', user: '张丽华', dept: 'X线室', action: '胶片打印', target: '患者林峰 女 35岁 检查号XR20260500065 腹部CT增强', result: '成功', ip: '192.168.1.118' },
  { id: 66, time: '2026-05-02 11:18:00', user: '刘芳', dept: 'MRI室', action: '报告书写', target: '患者杨帆 男 83岁 检查号XR20260500066 颈椎MRI增强', result: '成功', ip: '192.168.1.113' },
  { id: 67, time: '2026-05-02 11:21:00', user: '张丽华', dept: '导管室', action: 'CT增强', target: '患者何平 女 32岁 检查号CT20260500067 腹部CT增强', result: '成功', ip: '192.168.1.118' },
  { id: 68, time: '2026-05-02 11:24:00', user: '周敏', dept: 'X线室', action: '报告审核', target: '患者林峰 女 44岁 检查号XR20260500068 骨盆X线', result: '成功', ip: '192.168.1.107' },
  { id: 69, time: '2026-05-02 11:27:00', user: '张丽华', dept: 'CT室', action: '会诊申请', target: '患者杨帆 男 57岁 检查号XR20260500069 胸部CT平扫', result: '成功', ip: '192.168.1.104' },
  { id: 70, time: '2026-05-02 11:30:00', user: '吴昊', dept: 'MRI室', action: 'MRI增强', target: '患者林峰 男 61岁 检查号MRI20260500070 腹部CT增强', result: '成功', ip: '192.168.1.114' },
  { id: 71, time: '2026-05-02 11:33:00', user: '李明辉', dept: 'MRI室', action: 'CT检查', target: '患者龚凯 男 65岁 检查号CT20260500071 肺动脉CTA', result: '成功', ip: '192.168.1.115' },
  { id: 72, time: '2026-05-02 11:36:00', user: '吴昊', dept: '放射科', action: '设备预约', target: '患者李娜 女 77岁 检查号XR20260500072 颈椎MRI增强', result: '失败', ip: '192.168.1.111' },
  { id: 73, time: '2026-05-02 11:39:00', user: '赵强', dept: '导管室', action: '报告审核', target: '患者董洁 女 38岁 检查号XR20260500073 颅脑CT平扫', result: '成功', ip: '192.168.1.111' },
  { id: 74, time: '2026-05-02 11:42:00', user: '刘芳', dept: 'X线室', action: '会诊申请', target: '患者吴静 男 52岁 检查号XR20260500074 乳腺钼靶', result: '失败', ip: '192.168.1.109' },
  { id: 75, time: '2026-05-02 11:45:00', user: '张丽华', dept: 'X线室', action: '报告审核', target: '患者李娜 男 30岁 检查号XR20260500075 胸部CT平扫', result: '失败', ip: '192.168.1.108' },
  { id: 76, time: '2026-05-02 11:48:00', user: '郑杰', dept: 'MRI室', action: 'CT检查', target: '患者周涛 男 50岁 检查号CT20260500076 骨盆X线', result: '成功', ip: '192.168.1.113' },
  { id: 77, time: '2026-05-02 11:51:00', user: '李明辉', dept: 'CT室', action: 'CT检查', target: '患者何平 女 60岁 检查号CT20260500077 肺动脉CTA', result: '成功', ip: '192.168.1.106' },
  { id: 78, time: '2026-05-02 11:54:00', user: '李明辉', dept: '放射科', action: '危急值通知', target: '患者林峰 女 61岁 检查号XR20260500078 胸部X线', result: '失败', ip: '192.168.1.119' },
  { id: 79, time: '2026-05-02 11:57:00', user: '赵强', dept: 'CT室', action: 'CT检查', target: '患者张伟 男 82岁 检查号CT20260500079 腰椎MRI平扫', result: '失败', ip: '192.168.1.114' },
  { id: 80, time: '2026-05-02 12:00:00', user: '孙伟', dept: '登记处', action: '设备预约', target: '患者杨帆 女 49岁 检查号XR20260500080 颈椎MRI增强', result: '成功', ip: '192.168.1.115' },
  { id: 81, time: '2026-05-02 12:03:00', user: '吴昊', dept: '放射科', action: 'X线检查', target: '患者马超 男 65岁 检查号XR20260500081 骨盆X线', result: '成功', ip: '192.168.1.118' },
  { id: 82, time: '2026-05-02 12:06:00', user: '刘芳', dept: 'CT室', action: 'CT检查', target: '患者何平 女 64岁 检查号CT20260500082 胸部X线', result: '成功', ip: '192.168.1.106' },
  { id: 83, time: '2026-05-02 12:09:00', user: '张丽华', dept: 'CT室', action: '胶片打印', target: '患者谢娟 男 50岁 检查号XR20260500083 颅脑CT平扫', result: '成功', ip: '192.168.1.107' },
  { id: 84, time: '2026-05-02 12:12:00', user: '周敏', dept: '导管室', action: '报告书写', target: '患者董洁 男 19岁 检查号XR20260500084 冠脉CTA', result: '失败', ip: '192.168.1.116' },
  { id: 85, time: '2026-05-02 12:15:00', user: '张丽华', dept: 'X线室', action: '报告书写', target: '患者董洁 女 31岁 检查号XR20260500085 胸部CT平扫', result: '成功', ip: '192.168.1.117' },
  { id: 86, time: '2026-05-02 12:18:00', user: '周敏', dept: 'CT室', action: 'X线检查', target: '患者许超 男 30岁 检查号XR20260500086 腹部CT增强', result: '失败', ip: '192.168.1.118' },
  { id: 87, time: '2026-05-02 12:21:00', user: '王建军', dept: 'X线室', action: '设备预约', target: '患者赵敏 男 34岁 检查号XR20260500087 腰椎MRI平扫', result: '成功', ip: '192.168.1.107' },
  { id: 88, time: '2026-05-02 12:24:00', user: '赵强', dept: 'CT室', action: '设备预约', target: '患者许超 男 81岁 检查号XR20260500088 乳腺钼靶', result: '失败', ip: '192.168.1.113' },
  { id: 89, time: '2026-05-02 12:27:00', user: '陈晓东', dept: 'CT室', action: '胶片打印', target: '患者曾琳 男 19岁 检查号XR20260500089 骨盆X线', result: '成功', ip: '192.168.1.115' },
  { id: 90, time: '2026-05-02 12:30:00', user: '赵强', dept: '登记处', action: '胶片打印', target: '患者韩冰 女 66岁 检查号XR20260500090 颅脑CT平扫', result: '成功', ip: '192.168.1.112' },
  { id: 91, time: '2026-05-02 12:33:00', user: '郑杰', dept: 'X线室', action: '设备预约', target: '患者郑强 女 18岁 检查号XR20260500091 胸部X线', result: '成功', ip: '192.168.1.117' },
  { id: 92, time: '2026-05-02 12:36:00', user: '孙伟', dept: 'CT室', action: '报告审核', target: '患者孙鹏 女 30岁 检查号XR20260500092 冠脉CTA', result: '成功', ip: '192.168.1.105' },
  { id: 93, time: '2026-05-02 12:39:00', user: '吴昊', dept: '放射科', action: 'MRI检查', target: '患者李娜 女 55岁 检查号MRI20260500093 腰椎MRI平扫', result: '成功', ip: '192.168.1.102' },
  { id: 94, time: '2026-05-02 12:42:00', user: '李明辉', dept: 'X线室', action: 'CT增强', target: '患者蒋伟 女 41岁 检查号CT20260500094 颈椎MRI增强', result: '失败', ip: '192.168.1.106' },
  { id: 95, time: '2026-05-02 12:45:00', user: '郑杰', dept: 'CT室', action: 'MRI增强', target: '患者王磊 男 49岁 检查号MRI20260500095 胸部X线', result: '失败', ip: '192.168.1.102' },
  { id: 96, time: '2026-05-02 12:48:00', user: '王建军', dept: 'X线室', action: 'MRI增强', target: '患者钱琳 男 18岁 检查号MRI20260500096 骨盆X线', result: '成功', ip: '192.168.1.103' },
  { id: 97, time: '2026-05-02 12:51:00', user: '陈晓东', dept: '导管室', action: '报告书写', target: '患者韩冰 女 29岁 检查号XR20260500097 腰椎MRI平扫', result: '成功', ip: '192.168.1.113' },
  { id: 98, time: '2026-05-02 12:54:00', user: '王建军', dept: 'CT室', action: '设备预约', target: '患者马超 男 40岁 检查号XR20260500098 乳腺钼靶', result: '成功', ip: '192.168.1.115' },
  { id: 99, time: '2026-05-02 12:57:00', user: '李明辉', dept: 'CT室', action: 'CT增强', target: '患者张伟 男 21岁 检查号CT20260500099 胸部CT平扫', result: '成功', ip: '192.168.1.111' },
  { id: 100, time: '2026-05-02 13:00:00', user: '刘芳', dept: '登记处', action: '会诊申请', target: '患者蒋伟 男 46岁 检查号XR20260500100 肺动脉CTA', result: '成功', ip: '192.168.1.105' },
  { id: 101, time: '2026-05-02 13:03:00', user: '孙伟', dept: '登记处', action: 'CT检查', target: '患者张伟 女 29岁 检查号CT20260500101 乳腺钼靶', result: '成功', ip: '192.168.1.101' },
  { id: 102, time: '2026-05-02 13:06:00', user: '郑杰', dept: '登记处', action: '危急值通知', target: '患者何平 女 76岁 检查号XR20260500102 冠脉CTA', result: '成功', ip: '192.168.1.116' },
  { id: 103, time: '2026-05-02 13:09:00', user: '郑杰', dept: '登记处', action: 'X线检查', target: '患者李娜 男 74岁 检查号XR20260500103 肺动脉CTA', result: '成功', ip: '192.168.1.100' },
  { id: 104, time: '2026-05-02 13:12:00', user: '张丽华', dept: 'MRI室', action: '设备预约', target: '患者蒋伟 男 55岁 检查号XR20260500104 腹部CT增强', result: '成功', ip: '192.168.1.113' },
  { id: 105, time: '2026-05-02 13:15:00', user: '吴昊', dept: '登记处', action: '胶片打印', target: '患者蒋伟 男 63岁 检查号XR20260500105 腹部CT增强', result: '失败', ip: '192.168.1.114' },
  { id: 106, time: '2026-05-02 13:18:00', user: '周敏', dept: 'MRI室', action: 'DICOM浏览', target: '患者谢娟 女 26岁 检查号XR20260500106 乳腺钼靶', result: '成功', ip: '192.168.1.116' },
  { id: 107, time: '2026-05-02 13:21:00', user: '张丽华', dept: '登记处', action: '报告书写', target: '患者许超 女 44岁 检查号XR20260500107 乳腺钼靶', result: '成功', ip: '192.168.1.109' },
  { id: 108, time: '2026-05-02 13:24:00', user: '张丽华', dept: '登记处', action: '报告审核', target: '患者沈晨 男 69岁 检查号XR20260500108 胸部CT平扫', result: '失败', ip: '192.168.1.119' },
  { id: 109, time: '2026-05-02 13:27:00', user: '王建军', dept: '放射科', action: 'MRI检查', target: '患者杨帆 女 25岁 检查号MRI20260500109 腰椎MRI平扫', result: '成功', ip: '192.168.1.113' },
  { id: 110, time: '2026-05-02 13:30:00', user: '王建军', dept: 'CT室', action: 'DICOM浏览', target: '患者马超 男 59岁 检查号XR20260500110 腰椎MRI平扫', result: '成功', ip: '192.168.1.101' },
  { id: 111, time: '2026-05-02 13:33:00', user: '吴昊', dept: '放射科', action: 'DICOM浏览', target: '患者曾琳 男 64岁 检查号XR20260500111 颅脑CT平扫', result: '成功', ip: '192.168.1.114' },
  { id: 112, time: '2026-05-02 13:36:00', user: '张丽华', dept: 'X线室', action: '胶片打印', target: '患者郑强 男 67岁 检查号XR20260500112 肺动脉CTA', result: '失败', ip: '192.168.1.111' },
  { id: 113, time: '2026-05-02 13:39:00', user: '吴昊', dept: 'X线室', action: '会诊申请', target: '患者蒋伟 男 20岁 检查号XR20260500113 冠脉CTA', result: '成功', ip: '192.168.1.120' },
  { id: 114, time: '2026-05-02 13:42:00', user: '周敏', dept: 'X线室', action: '胶片打印', target: '患者郑强 男 75岁 检查号XR20260500114 乳腺钼靶', result: '失败', ip: '192.168.1.120' },
  { id: 115, time: '2026-05-02 13:45:00', user: '吴昊', dept: 'MRI室', action: '报告书写', target: '患者林峰 女 73岁 检查号XR20260500115 颅脑CT平扫', result: '成功', ip: '192.168.1.110' },
  { id: 116, time: '2026-05-02 13:48:00', user: '孙伟', dept: 'X线室', action: 'CT增强', target: '患者马超 女 73岁 检查号CT20260500116 胸部X线', result: '成功', ip: '192.168.1.116' },
  { id: 117, time: '2026-05-02 13:51:00', user: '吴昊', dept: 'X线室', action: 'MRI增强', target: '患者林峰 男 67岁 检查号MRI20260500117 冠脉CTA', result: '成功', ip: '192.168.1.111' },
  { id: 118, time: '2026-05-02 13:54:00', user: '周敏', dept: '放射科', action: 'X线检查', target: '患者郑强 女 83岁 检查号XR20260500118 冠脉CTA', result: '成功', ip: '192.168.1.116' },
  { id: 119, time: '2026-05-02 13:57:00', user: '孙伟', dept: '放射科', action: 'CT检查', target: '患者周涛 男 76岁 检查号CT20260500119 腰椎MRI平扫', result: '失败', ip: '192.168.1.106' },
  { id: 120, time: '2026-05-02 14:00:00', user: '赵强', dept: 'X线室', action: 'DICOM浏览', target: '患者王磊 女 33岁 检查号XR20260500120 腹部CT增强', result: '成功', ip: '192.168.1.107' },
  { id: 121, time: '2026-05-02 14:03:00', user: '李明辉', dept: 'MRI室', action: 'MRI增强', target: '患者韩冰 女 31岁 检查号MRI20260500121 颈椎MRI增强', result: '成功', ip: '192.168.1.114' },
  { id: 122, time: '2026-05-02 14:06:00', user: '刘芳', dept: '放射科', action: 'CT检查', target: '患者吴静 男 63岁 检查号CT20260500122 肺动脉CTA', result: '成功', ip: '192.168.1.114' },
  { id: 123, time: '2026-05-02 14:09:00', user: '李明辉', dept: 'X线室', action: '胶片打印', target: '患者吴静 男 73岁 检查号XR20260500123 骨盆X线', result: '失败', ip: '192.168.1.108' },
  { id: 124, time: '2026-05-02 14:12:00', user: '郑杰', dept: '导管室', action: 'DICOM浏览', target: '患者林峰 女 21岁 检查号XR20260500124 肺动脉CTA', result: '成功', ip: '192.168.1.115' },
  { id: 125, time: '2026-05-02 14:15:00', user: '张丽华', dept: '登记处', action: '胶片打印', target: '患者蒋伟 男 23岁 检查号XR20260500125 乳腺钼靶', result: '失败', ip: '192.168.1.103' },
  { id: 126, time: '2026-05-02 14:18:00', user: '吴昊', dept: 'MRI室', action: '设备预约', target: '患者胡霞 女 37岁 检查号XR20260500126 腹部CT增强', result: '成功', ip: '192.168.1.102' },
  { id: 127, time: '2026-05-02 14:21:00', user: '李明辉', dept: 'MRI室', action: '设备预约', target: '患者韩冰 女 31岁 检查号XR20260500127 腹部CT增强', result: '失败', ip: '192.168.1.109' },
  { id: 128, time: '2026-05-02 14:24:00', user: '王建军', dept: '登记处', action: 'X线检查', target: '患者胡霞 女 64岁 检查号XR20260500128 颅脑CT平扫', result: '成功', ip: '192.168.1.112' },
  { id: 129, time: '2026-05-02 14:27:00', user: '孙伟', dept: '放射科', action: 'MRI增强', target: '患者张伟 男 40岁 检查号MRI20260500129 肺动脉CTA', result: '成功', ip: '192.168.1.111' },
  { id: 130, time: '2026-05-02 14:30:00', user: '吴昊', dept: '导管室', action: 'DICOM浏览', target: '患者孙鹏 女 47岁 检查号XR20260500130 肺动脉CTA', result: '成功', ip: '192.168.1.107' },
  { id: 131, time: '2026-05-02 14:33:00', user: '吴昊', dept: 'MRI室', action: 'DICOM浏览', target: '患者曾琳 男 69岁 检查号XR20260500131 胸部CT平扫', result: '成功', ip: '192.168.1.112' },
  { id: 132, time: '2026-05-02 14:36:00', user: '陈晓东', dept: '放射科', action: '报告审核', target: '患者何平 男 22岁 检查号XR20260500132 颅脑CT平扫', result: '成功', ip: '192.168.1.103' },
  { id: 133, time: '2026-05-02 14:39:00', user: '赵强', dept: 'MRI室', action: 'MRI检查', target: '患者周涛 女 38岁 检查号MRI20260500133 胸部CT平扫', result: '成功', ip: '192.168.1.111' },
  { id: 134, time: '2026-05-02 14:42:00', user: '吴昊', dept: 'CT室', action: 'X线检查', target: '患者曾琳 女 29岁 检查号XR20260500134 腰椎MRI平扫', result: '失败', ip: '192.168.1.116' },
  { id: 135, time: '2026-05-02 14:45:00', user: '周敏', dept: '登记处', action: '胶片打印', target: '患者谢娟 女 23岁 检查号XR20260500135 肺动脉CTA', result: '成功', ip: '192.168.1.113' },
  { id: 136, time: '2026-05-02 14:48:00', user: '吴昊', dept: 'CT室', action: 'MRI检查', target: '患者韩冰 男 81岁 检查号MRI20260500136 腹部CT增强', result: '成功', ip: '192.168.1.100' },
  { id: 137, time: '2026-05-02 14:51:00', user: '孙伟', dept: 'X线室', action: 'CT增强', target: '患者许超 女 44岁 检查号CT20260500137 冠脉CTA', result: '失败', ip: '192.168.1.104' },
  { id: 138, time: '2026-05-02 14:54:00', user: '吴昊', dept: '放射科', action: 'X线检查', target: '患者杨帆 女 34岁 检查号XR20260500138 颈椎MRI增强', result: '失败', ip: '192.168.1.105' },
  { id: 139, time: '2026-05-02 14:57:00', user: '陈晓东', dept: 'MRI室', action: '危急值通知', target: '患者董洁 男 31岁 检查号XR20260500139 冠脉CTA', result: '成功', ip: '192.168.1.109' },
  { id: 140, time: '2026-05-02 15:00:00', user: '孙伟', dept: '导管室', action: 'MRI检查', target: '患者钱琳 男 20岁 检查号MRI20260500140 胸部X线', result: '成功', ip: '192.168.1.100' },
  { id: 141, time: '2026-05-02 15:03:00', user: '王建军', dept: 'X线室', action: 'MRI检查', target: '患者龚凯 女 66岁 检查号MRI20260500141 骨盆X线', result: '成功', ip: '192.168.1.103' },
  { id: 142, time: '2026-05-02 15:06:00', user: '陈晓东', dept: '导管室', action: 'MRI检查', target: '患者周涛 女 80岁 检查号MRI20260500142 颅脑CT平扫', result: '失败', ip: '192.168.1.110' },
  { id: 143, time: '2026-05-02 15:09:00', user: '孙伟', dept: '导管室', action: 'MRI检查', target: '患者张伟 女 25岁 检查号MRI20260500143 颅脑CT平扫', result: '成功', ip: '192.168.1.106' },
  { id: 144, time: '2026-05-02 15:12:00', user: '王建军', dept: '放射科', action: '报告审核', target: '患者胡霞 女 36岁 检查号XR20260500144 胸部X线', result: '成功', ip: '192.168.1.100' },
  { id: 145, time: '2026-05-02 15:15:00', user: '赵强', dept: 'CT室', action: 'CT增强', target: '患者韩冰 男 32岁 检查号CT20260500145 乳腺钼靶', result: '成功', ip: '192.168.1.118' },
  { id: 146, time: '2026-05-02 15:18:00', user: '赵强', dept: 'CT室', action: '危急值通知', target: '患者杨帆 男 82岁 检查号XR20260500146 骨盆X线', result: '成功', ip: '192.168.1.102' },
  { id: 147, time: '2026-05-02 15:21:00', user: '张丽华', dept: 'MRI室', action: 'X线检查', target: '患者张伟 男 52岁 检查号XR20260500147 乳腺钼靶', result: '成功', ip: '192.168.1.107' },
  { id: 148, time: '2026-05-02 15:24:00', user: '陈晓东', dept: 'MRI室', action: 'CT检查', target: '患者李娜 女 29岁 检查号CT20260500148 颅脑CT平扫', result: '成功', ip: '192.168.1.113' },
  { id: 149, time: '2026-05-02 15:27:00', user: '赵强', dept: '放射科', action: 'CT检查', target: '患者周涛 女 78岁 检查号CT20260500149 胸部CT平扫', result: '成功', ip: '192.168.1.102' },
  { id: 150, time: '2026-05-02 15:30:00', user: '孙伟', dept: '登记处', action: '设备预约', target: '患者蒋伟 女 19岁 检查号XR20260500150 腰椎MRI平扫', result: '成功', ip: '192.168.1.105' },
  { id: 151, time: '2026-05-02 15:33:00', user: '吴昊', dept: '登记处', action: '胶片打印', target: '患者马超 男 40岁 检查号XR20260500151 颈椎MRI增强', result: '失败', ip: '192.168.1.108' },
  { id: 152, time: '2026-05-02 15:36:00', user: '陈晓东', dept: '放射科', action: 'CT增强', target: '患者吴静 男 75岁 检查号CT20260500152 胸部X线', result: '成功', ip: '192.168.1.101' },
  { id: 153, time: '2026-05-02 15:39:00', user: '王建军', dept: '登记处', action: '报告审核', target: '患者沈晨 女 62岁 检查号XR20260500153 胸部CT平扫', result: '失败', ip: '192.168.1.105' },
  { id: 154, time: '2026-05-02 15:42:00', user: '张丽华', dept: '放射科', action: '危急值通知', target: '患者许超 女 45岁 检查号XR20260500154 冠脉CTA', result: '成功', ip: '192.168.1.111' },
  { id: 155, time: '2026-05-02 15:45:00', user: '王建军', dept: '导管室', action: '危急值通知', target: '患者蒋伟 女 61岁 检查号XR20260500155 腰椎MRI平扫', result: '成功', ip: '192.168.1.106' },
  { id: 156, time: '2026-05-02 15:48:00', user: '王建军', dept: 'MRI室', action: 'DICOM浏览', target: '患者谢娟 男 72岁 检查号XR20260500156 肺动脉CTA', result: '成功', ip: '192.168.1.104' },
  { id: 157, time: '2026-05-02 15:51:00', user: '王建军', dept: 'MRI室', action: '危急值通知', target: '患者董洁 男 50岁 检查号XR20260500157 胸部X线', result: '成功', ip: '192.168.1.111' },
  { id: 158, time: '2026-05-02 15:54:00', user: '陈晓东', dept: '放射科', action: '报告审核', target: '患者许超 男 85岁 检查号XR20260500158 腰椎MRI平扫', result: '失败', ip: '192.168.1.107' },
  { id: 159, time: '2026-05-02 15:57:00', user: '周敏', dept: '登记处', action: '危急值通知', target: '患者曾琳 女 49岁 检查号XR20260500159 腰椎MRI平扫', result: '成功', ip: '192.168.1.110' },
  { id: 160, time: '2026-05-02 16:00:00', user: '张丽华', dept: '登记处', action: '报告书写', target: '患者赵敏 女 26岁 检查号XR20260500160 胸部CT平扫', result: '成功', ip: '192.168.1.117' },
  { id: 161, time: '2026-05-02 16:03:00', user: '陈晓东', dept: 'CT室', action: 'MRI检查', target: '患者李娜 女 78岁 检查号MRI20260500161 颅脑CT平扫', result: '成功', ip: '192.168.1.110' },
  { id: 162, time: '2026-05-02 16:06:00', user: '张丽华', dept: '导管室', action: '报告审核', target: '患者钱琳 男 20岁 检查号XR20260500162 冠脉CTA', result: '成功', ip: '192.168.1.115' },
  { id: 163, time: '2026-05-02 16:09:00', user: '王建军', dept: '放射科', action: 'X线检查', target: '患者钱琳 男 56岁 检查号XR20260500163 冠脉CTA', result: '失败', ip: '192.168.1.108' },
  { id: 164, time: '2026-05-02 16:12:00', user: '王建军', dept: 'X线室', action: '胶片打印', target: '患者许超 女 60岁 检查号XR20260500164 乳腺钼靶', result: '失败', ip: '192.168.1.100' },
  { id: 165, time: '2026-05-02 16:15:00', user: '吴昊', dept: '导管室', action: '胶片打印', target: '患者王磊 女 73岁 检查号XR20260500165 胸部X线', result: '成功', ip: '192.168.1.104' },
  { id: 166, time: '2026-05-02 16:18:00', user: '李明辉', dept: 'X线室', action: '设备预约', target: '患者赵敏 男 36岁 检查号XR20260500166 腰椎MRI平扫', result: '成功', ip: '192.168.1.105' },
  { id: 167, time: '2026-05-02 16:21:00', user: '孙伟', dept: 'X线室', action: 'MRI增强', target: '患者曾琳 男 44岁 检查号MRI20260500167 乳腺钼靶', result: '成功', ip: '192.168.1.117' },
  { id: 168, time: '2026-05-02 16:24:00', user: '郑杰', dept: '导管室', action: 'CT增强', target: '患者郑强 女 64岁 检查号CT20260500168 腹部CT增强', result: '成功', ip: '192.168.1.113' },
  { id: 169, time: '2026-05-02 16:27:00', user: '吴昊', dept: 'MRI室', action: 'MRI增强', target: '患者赵敏 男 81岁 检查号MRI20260500169 骨盆X线', result: '成功', ip: '192.168.1.109' },
  { id: 170, time: '2026-05-02 16:30:00', user: '陈晓东', dept: 'X线室', action: 'CT增强', target: '患者胡霞 女 41岁 检查号CT20260500170 颈椎MRI增强', result: '失败', ip: '192.168.1.120' },
  { id: 171, time: '2026-05-02 16:33:00', user: '王建军', dept: '放射科', action: 'X线检查', target: '患者韩冰 女 83岁 检查号XR20260500171 胸部CT平扫', result: '成功', ip: '192.168.1.106' },
  { id: 172, time: '2026-05-02 16:36:00', user: '李明辉', dept: '导管室', action: 'MRI增强', target: '患者沈晨 男 24岁 检查号MRI20260500172 冠脉CTA', result: '成功', ip: '192.168.1.105' },
  { id: 173, time: '2026-05-02 16:39:00', user: '周敏', dept: '登记处', action: 'MRI检查', target: '患者董洁 女 23岁 检查号MRI20260500173 颅脑CT平扫', result: '成功', ip: '192.168.1.111' },
  { id: 174, time: '2026-05-02 16:42:00', user: '郑杰', dept: '放射科', action: '会诊申请', target: '患者张伟 女 22岁 检查号XR20260500174 冠脉CTA', result: '成功', ip: '192.168.1.113' },
  { id: 175, time: '2026-05-02 16:45:00', user: '李明辉', dept: 'CT室', action: 'MRI检查', target: '患者马超 男 24岁 检查号MRI20260500175 乳腺钼靶', result: '成功', ip: '192.168.1.115' },
  { id: 176, time: '2026-05-02 16:48:00', user: '张丽华', dept: 'X线室', action: '胶片打印', target: '患者张伟 女 50岁 检查号XR20260500176 颈椎MRI增强', result: '成功', ip: '192.168.1.111' },
  { id: 177, time: '2026-05-02 16:51:00', user: '周敏', dept: '登记处', action: 'CT增强', target: '患者龚凯 女 67岁 检查号CT20260500177 肺动脉CTA', result: '成功', ip: '192.168.1.104' },
  { id: 178, time: '2026-05-02 16:54:00', user: '吴昊', dept: 'MRI室', action: '危急值通知', target: '患者杨帆 女 77岁 检查号XR20260500178 肺动脉CTA', result: '成功', ip: '192.168.1.109' },
  { id: 179, time: '2026-05-02 16:57:00', user: '赵强', dept: 'CT室', action: 'CT检查', target: '患者李娜 男 82岁 检查号CT20260500179 胸部X线', result: '失败', ip: '192.168.1.104' },
  { id: 180, time: '2026-05-02 17:00:00', user: '吴昊', dept: '登记处', action: 'MRI检查', target: '患者李娜 女 26岁 检查号MRI20260500180 乳腺钼靶', result: '成功', ip: '192.168.1.115' },
  { id: 181, time: '2026-05-02 17:03:00', user: '李明辉', dept: 'CT室', action: '设备预约', target: '患者董洁 女 19岁 检查号XR20260500181 乳腺钼靶', result: '成功', ip: '192.168.1.104' },
  { id: 182, time: '2026-05-02 17:06:00', user: '周敏', dept: '导管室', action: '设备预约', target: '患者曾琳 女 36岁 检查号XR20260500182 颅脑CT平扫', result: '成功', ip: '192.168.1.120' },
  { id: 183, time: '2026-05-02 17:09:00', user: '周敏', dept: 'MRI室', action: '会诊申请', target: '患者马超 女 68岁 检查号XR20260500183 乳腺钼靶', result: '成功', ip: '192.168.1.113' },
  { id: 184, time: '2026-05-02 17:12:00', user: '陈晓东', dept: '登记处', action: 'CT检查', target: '患者赵敏 男 47岁 检查号CT20260500184 乳腺钼靶', result: '成功', ip: '192.168.1.103' },
  { id: 185, time: '2026-05-02 17:15:00', user: '赵强', dept: '登记处', action: '设备预约', target: '患者龚凯 女 37岁 检查号XR20260500185 颈椎MRI增强', result: '失败', ip: '192.168.1.101' },
  { id: 186, time: '2026-05-02 17:18:00', user: '李明辉', dept: 'X线室', action: '会诊申请', target: '患者何平 男 81岁 检查号XR20260500186 胸部CT平扫', result: '成功', ip: '192.168.1.119' },
  { id: 187, time: '2026-05-02 17:21:00', user: '周敏', dept: '导管室', action: 'CT检查', target: '患者周涛 男 20岁 检查号CT20260500187 骨盆X线', result: '成功', ip: '192.168.1.116' },
  { id: 188, time: '2026-05-02 17:24:00', user: '孙伟', dept: 'X线室', action: 'CT增强', target: '患者董洁 女 62岁 检查号CT20260500188 颅脑CT平扫', result: '成功', ip: '192.168.1.115' },
  { id: 189, time: '2026-05-02 17:27:00', user: '刘芳', dept: '登记处', action: 'CT增强', target: '患者蒋伟 女 48岁 检查号CT20260500189 胸部CT平扫', result: '成功', ip: '192.168.1.106' },
  { id: 190, time: '2026-05-02 17:30:00', user: '吴昊', dept: '放射科', action: '报告审核', target: '患者曾琳 男 56岁 检查号XR20260500190 肺动脉CTA', result: '失败', ip: '192.168.1.114' },
  { id: 191, time: '2026-05-02 17:33:00', user: '吴昊', dept: 'CT室', action: '危急值通知', target: '患者张伟 女 84岁 检查号XR20260500191 腹部CT增强', result: '失败', ip: '192.168.1.119' },
  { id: 192, time: '2026-05-02 17:36:00', user: '陈晓东', dept: 'CT室', action: '设备预约', target: '患者何平 男 60岁 检查号XR20260500192 胸部CT平扫', result: '成功', ip: '192.168.1.106' },
  { id: 193, time: '2026-05-02 17:39:00', user: '张丽华', dept: 'MRI室', action: 'DICOM浏览', target: '患者沈晨 男 54岁 检查号XR20260500193 骨盆X线', result: '成功', ip: '192.168.1.103' },
  { id: 194, time: '2026-05-02 17:42:00', user: '刘芳', dept: 'CT室', action: '会诊申请', target: '患者马超 男 49岁 检查号XR20260500194 肺动脉CTA', result: '成功', ip: '192.168.1.114' },
  { id: 195, time: '2026-05-02 17:45:00', user: '周敏', dept: 'CT室', action: 'CT检查', target: '患者杨帆 女 26岁 检查号CT20260500195 腹部CT增强', result: '成功', ip: '192.168.1.100' },
  { id: 196, time: '2026-05-02 17:48:00', user: '吴昊', dept: '放射科', action: 'MRI增强', target: '患者张伟 女 82岁 检查号MRI20260500196 骨盆X线', result: '成功', ip: '192.168.1.108' },
  { id: 197, time: '2026-05-02 17:51:00', user: '郑杰', dept: 'CT室', action: 'MRI检查', target: '患者吴静 男 44岁 检查号MRI20260500197 胸部X线', result: '成功', ip: '192.168.1.111' },
  { id: 198, time: '2026-05-02 17:54:00', user: '周敏', dept: 'X线室', action: 'MRI检查', target: '患者许超 男 81岁 检查号MRI20260500198 胸部CT平扫', result: '成功', ip: '192.168.1.120' },
  { id: 199, time: '2026-05-02 17:57:00', user: '刘芳', dept: 'MRI室', action: '会诊申请', target: '患者孙鹏 男 27岁 检查号XR20260500199 胸部X线', result: '成功', ip: '192.168.1.119' },
  { id: 200, time: '2026-05-02 18:00:00', user: '李明辉', dept: '导管室', action: '报告书写', target: '患者周涛 男 24岁 检查号XR20260500200 肺动脉CTA', result: '成功', ip: '192.168.1.101' },
];

const statCards = [
  { label: '今日操作总数', value: '128', icon: '📊', color: '#1e40af' },
  { label: 'CT检查', value: '42', icon: '🏥', color: '#3b82f6' },
  { label: 'MRI检查', value: '28', icon: '🧲', color: '#06b6d4' },
  { label: '报告书写', value: '35', icon: '📝', color: '#10b981' },
  { label: '胶片打印', value: '23', icon: '🖨️', color: '#f59e0b' },
];

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '24px',
    background: '#f5f5f5',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1e40af',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginTop: '4px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: '13px',
    color: '#888',
    marginTop: '2px',
  },
  tableCard: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  tableHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  filterBtn: {
    padding: '8px 16px',
    background: '#f0f4ff',
    border: 'none',
    borderRadius: '6px',
    color: '#1e40af',
    fontSize: '13px',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    background: '#f8fafc',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#333',
    borderBottom: '1px solid #f1f5f9',
  },
  actionBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  resultBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
};

const getActionStyle = (action: string): React.CSSProperties => {
  const colorMap: { [key: string]: string } = {
    'CT检查': '#3b82f6',
    'CT增强': '#8b5cf6',
    'MRI检查': '#06b6d4',
    'X线检查': '#10b981',
    '报告书写': '#f59e0b',
    '报告审核': '#84cc16',
    '胶片打印': '#f97316',
    'DICOM浏览': '#ec4899',
  };
  return { ...styles.actionBadge, background: `${colorMap[action] || '#64748b'}20`, color: colorMap[action] || '#64748b' };
};

const getResultStyle = (result: string): React.CSSProperties => {
  const isSuccess = result === '成功';
  return {
    ...styles.resultBadge,
    background: isSuccess ? '#dcfce7' : '#fee2e2',
    color: isSuccess ? '#16a34a' : '#dc2626',
  };
};

export default function AuditPage() {
  const [logs] = useState<LogEntry[]>(mockLogs);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>审计日志</h1>
        <p style={styles.subtitle}>Radiology Information System - 操作日志审计</p>
      </div>

      <div style={styles.statsGrid}>
        {statCards.map((card, index) => (
          <div key={index} style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: `${card.color}15` }}>
              {card.icon}
            </div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>{card.value}</div>
              <div style={styles.statLabel}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>操作日志明细</h3>
          <button
            onClick={() => {
              // Apply filter - toggle filter panel or apply current filters
              const filterPanel = document.getElementById('filter-panel')
              if (filterPanel) {
                filterPanel.style.display = filterPanel.style.display === 'none' ? 'block' : 'none'
              }
            }}
            style={styles.filterBtn}>🔍 筛选</button>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>时间</th>
              <th style={styles.th}>用户</th>
              <th style={styles.th}>科室</th>
              <th style={styles.th}>操作类型</th>
              <th style={styles.th}>操作对象</th>
              <th style={styles.th}>结果</th>
              <th style={styles.th}>IP地址</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={styles.td}>{log.time}</td>
                <td style={styles.td}>{log.user}</td>
                <td style={styles.td}>{log.dept}</td>
                <td style={styles.td}>
                  <span style={getActionStyle(log.action)}>{log.action}</span>
                </td>
                <td style={styles.td}>{log.target}</td>
                <td style={styles.td}>
                  <span style={getResultStyle(log.result)}>{log.result}</span>
                </td>
                <td style={styles.td}>{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
