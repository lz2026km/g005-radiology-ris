import React from "react";
import { Divider, Button, message } from "antd";
import { MessageSquare, Phone, Video, UserPlus } from "lucide-react";
import type {
  V4ReportState,
  V4ReportActions,
} from "../../hooks/useV4ReportState";

interface Props {
  reportState: V4ReportState & V4ReportActions;
}

const V4CollaborationDrawerContent: React.FC<Props> = ({ reportState }) => {
  const { collaborators } = reportState;

  return (
    <div className="v4-collab-drawer">
      <div className="v4-collab-online">
        {collaborators.map((c) => (
          <div key={c.name} className="v4-collab-person">
            <div className="v4-collab-avatar">
              <div
                className={`v4-collab-status v4-collab-status--${c.status}`}
              />
              <span className="v4-collab-avatar-text">{c.name[0]}</span>
            </div>
            <div className="v4-collab-info">
              <div className="v4-collab-name">{c.name}</div>
              <div className="v4-collab-role">{c.role}</div>
            </div>
            <div className="v4-collab-actions">
              <Button
                size="small"
                type="text"
                icon={<MessageSquare className="v4-icon v4-icon--xs" />}
                onClick={() => message.info(`发送消息给 ${c.name}`)}
              />
              <Button
                size="small"
                type="text"
                icon={<Phone className="v4-icon v4-icon--xs" />}
                onClick={() => message.info(`呼叫 ${c.name}`)}
              />
              <Button
                size="small"
                type="text"
                icon={<Video className="v4-icon v4-icon--xs" />}
                onClick={() => message.info(`视频通话 ${c.name}`)}
              />
            </div>
            <div className="v4-collab-last-active">{c.lastActive}</div>
          </div>
        ))}
      </div>

      <Divider className="v4-collab-divider" />

      <Button
        block
        icon={<UserPlus className="v4-icon v4-icon--sm" />}
        onClick={() => message.info("邀请协作人员")}
      >
        邀请协作
      </Button>
    </div>
  );
};

export default V4CollaborationDrawerContent;
