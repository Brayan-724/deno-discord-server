/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/@lit/reactive-element@2.0.2/decorators/query-assigned-elements.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function e(e){return(t,r)=>{const{slot:n,selector:o}=e??{},s="slot"+(n?`[name=${n}]`:":not([name])");return((e,t,r)=>(r.configurable=!0,r.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,r),r))(t,r,{get(){const t=this.renderRoot?.querySelector(s),r=t?.assignedElements(e)??[];return void 0===o?r:r.filter((e=>e.matches(o)))}})}}export{e as queryAssignedElements};export default null;
//# sourceMappingURL=/sm/4174b5ca9df6223aa6caf3b3f0532d280d544a7c8cdfecfc5748c8830d8c19e3.map