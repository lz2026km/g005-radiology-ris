import React from "react";
import { Tooltip } from "antd";
import { Star, Image } from "lucide-react";
import type {
  V4ReportState,
  V4ReportActions,
} from "../../hooks/useV4ReportState";

interface Props {
  reportState: V4ReportState & V4ReportActions;
}

const V4BottomStrip: React.FC<Props> = ({ reportState }) => {
  const { report } = reportState;
  const { images } = report.content;

  if (images.length === 0) return null;

  return (
    <div className="v4-bottom-strip">
      <div className="v4-bottom-strip-inner">
        {images.map((img) => (
          <Tooltip key={img.id} title={img.description}>
            <div
              className={`v4-thumbnail ${img.starred ? "v4-thumbnail--starred" : ""}`}
            >
              <div className="v4-thumbnail-placeholder">
                <Image className="v4-icon" />
              </div>
              {img.starred && <Star className="v4-thumbnail-star" />}
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default V4BottomStrip;
