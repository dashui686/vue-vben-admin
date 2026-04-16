<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Spin,
} from 'ant-design-vue';

import { getCacheInfo } from '#/api/monitor/cache';

const loading = ref(false);
const cacheInfo = ref<{
  commandStats: Array<{ name: string; value: number }>;
  dbSize: number;
  info: Record<string, string>;
}>();

const commandChartRef = ref<EchartsUIType>();
const memoryChartRef = ref<EchartsUIType>();
const { renderEcharts: renderCommandChart } = useEcharts(commandChartRef);
const { renderEcharts: renderMemoryChart } = useEcharts(memoryChartRef);

async function loadData() {
  loading.value = true;
  try {
    const res = await getCacheInfo();
    cacheInfo.value = res;

    renderCommandChart({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      series: [
        {
          name: '命令',
          type: 'pie',
          roseType: 'radius',
          radius: [15, 95],
          center: ['50%', '38%'],
          data: res.commandStats,
          animationEasing: 'cubicInOut',
          animationDuration: 1000,
        },
      ],
    });

    const usedMemory = Number.parseFloat(res.info.used_memory_human);
    renderMemoryChart({
      tooltip: {
        formatter: `{b} <br/>{a} : ${res.info.used_memory_human}`,
      },
      series: [
        {
          name: '峰值',
          type: 'gauge',
          min: 0,
          max: 1000,
          detail: {
            formatter: res.info.used_memory_human,
          },
          data: [
            {
              value: usedMemory,
              name: '内存消耗',
            },
          ],
        },
      ],
    });
  } finally {
    loading.value = false;
  }
}

function formatRedisMode(val?: string) {
  if (!val) return '';
  return val === 'standalone' ? '单机' : '集群';
}

function formatYesNo(val?: string) {
  if (!val) return '';
  return val === '0' ? '否' : '是';
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <Page auto-content-height>
    <Spin :spinning="loading">
      <div class="space-y-4">
        <!-- Redis 基本信息 -->
        <Card title="基本信息">
          <Descriptions
            v-if="cacheInfo?.info"
            :column="4"
            bordered
            size="small"
            :label-style="{ width: '140px' }"
          >
            <DescriptionsItem label="Redis版本">
              {{ cacheInfo.info.redis_version }}
            </DescriptionsItem>
            <DescriptionsItem label="运行模式">
              {{ formatRedisMode(cacheInfo.info.redis_mode) }}
            </DescriptionsItem>
            <DescriptionsItem label="端口">
              {{ cacheInfo.info.tcp_port }}
            </DescriptionsItem>
            <DescriptionsItem label="客户端数">
              {{ cacheInfo.info.connected_clients }}
            </DescriptionsItem>

            <DescriptionsItem label="运行时间(天)">
              {{ cacheInfo.info.uptime_in_days }}
            </DescriptionsItem>
            <DescriptionsItem label="使用内存">
              {{ cacheInfo.info.used_memory_human }}
            </DescriptionsItem>
            <DescriptionsItem label="使用CPU">
              {{
                parseFloat(
                  cacheInfo.info.used_cpu_user_children || '0',
                ).toFixed(2)
              }}
            </DescriptionsItem>
            <DescriptionsItem label="内存配置">
              {{ cacheInfo.info.maxmemory_human }}
            </DescriptionsItem>

            <DescriptionsItem label="AOF是否开启">
              {{ formatYesNo(cacheInfo.info.aof_enabled) }}
            </DescriptionsItem>
            <DescriptionsItem label="RDB是否成功">
              {{ cacheInfo.info.rdb_last_bgsave_status }}
            </DescriptionsItem>
            <DescriptionsItem label="Key数量">
              {{ cacheInfo.dbSize }}
            </DescriptionsItem>
            <DescriptionsItem label="网络入口/出口">
              {{ cacheInfo.info.instantaneous_input_kbps }}kps/{{
                cacheInfo.info.instantaneous_output_kbps
              }}kps
            </DescriptionsItem>
          </Descriptions>
        </Card>

        <!-- 命令统计 + 内存信息 -->
        <div class="grid grid-cols-2 gap-4">
          <Card title="命令统计">
            <EchartsUI ref="commandChartRef" height="420px" />
          </Card>
          <Card title="内存信息">
            <EchartsUI ref="memoryChartRef" height="420px" />
          </Card>
        </div>

        <div class="text-center">
          <Button type="primary" :loading="loading" @click="loadData">
            刷新缓存信息
          </Button>
        </div>
      </div>
    </Spin>
  </Page>
</template>
