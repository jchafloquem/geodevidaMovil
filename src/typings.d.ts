import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Draw {
    export const Event: any;
  }
  namespace Control {
    class Draw extends L.Control {
      constructor(options?: any);
    }
  }
}
