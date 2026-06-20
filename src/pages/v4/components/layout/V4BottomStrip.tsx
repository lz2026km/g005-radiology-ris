import React from 'react';
import { Tooltip } from 'antd';
import { Star, Image } from 'lucide-react';
import type { V4ReportCombined, V4ReportActions } from '../../hooks/useV4ReportState';

interface Props {
  reportState: V4ReportCombined & V4ReportActions;
}

const V4BottomStrip: React.FC<Props> = ({ reportState }) => {
  const { context } = reportState;
  const anchors = (context as any).anchors || [];

  if (anchors.length === 0) return null;

  return (
    <div className="v4-bottom-strip">
      <div className="v4-bottom-strip-inner">
        {anchors.map((a: any) => (
          <Tooltip key={a.id} title={`${a.seriesDescription || ''} — ${a.findings || ''}`}>
            <div className={`v4-thumbnail ${a.pinnedBy ? 'v4-thumbnail--starred' : ''}`}>
              <div className="v4-thumbnail-placeholder">
                <Image className="v4-icon" />
              </div>
              {a.pinnedBy && <Star className="v4-thumbnail-star" />}
              <div className="v4-thumbnail-label">{a.bodyPart || '影像'}</div>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default V4BottomStrip;
