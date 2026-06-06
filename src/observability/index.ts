/**
 * G005 放射RIS系统 v3.0.0 - 可观测性索引
 * Phase T4-W10: Sentry + Web Vitals + 自定义埋点
 */

export {
  initSentry,
  captureError,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  Sentry,
} from './sentry';

export {
  reportWebVitals,
  performanceMarks,
  getVitalRating,
  type WebVitalReporter,
} from './webVitals';
