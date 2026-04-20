import { defineComponent, h, ref } from 'vue';

import { Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

import ApprovalContent from './approval-content.vue';

export interface ApproveWithReasonModalProps {
  title: string;
  description: string;
  onOk: (reason: string) => void;
}

export function approveWithReasonModal(props: ApproveWithReasonModalProps) {
  const { onOk, title, description } = props;
  const content = ref('');
  Modal.confirm({
    title,
    content: h(
      defineComponent({
        setup() {
          return () =>
            h(ApprovalContent, {
              description,
              value: content.value,
              'onUpdate:value': (v: string) => (content.value = v),
            });
        },
      }),
    ),
    centered: true,
    okButtonProps: { danger: true },
    onOk: () => onOk(content.value),
  });
}

dayjs.extend(duration);
dayjs.extend(relativeTime);

export function getDiffTimeString(dateTime: string) {
  const diffSeconds = dayjs().diff(dayjs(dateTime), 'second');
  return dayjs.duration(diffSeconds, 'seconds').humanize();
}
