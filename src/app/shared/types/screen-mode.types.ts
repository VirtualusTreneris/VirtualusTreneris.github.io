import { ScreenMode } from '../constants/screen-mode.constants';

/** Route `data` that sets the screen mode. Every screen route must have it. */
export interface ScreenModeRouteData {
  screenMode: ScreenMode;
}
