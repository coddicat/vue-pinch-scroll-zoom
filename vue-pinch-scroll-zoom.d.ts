import Vue, { PluginFunction, VueConstructor } from 'vue';

declare const VuePinchScrollZoom: VueConstructor<Vue> & { install: PluginFunction<any>; };
export default VuePinchScrollZoom;
