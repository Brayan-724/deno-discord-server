/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/@lit/reactive-element@2.0.2/decorators/query-assigned-nodes.js
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
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function e(e){return(t,o)=>{const{slot:r}=e??{},n="slot"+(r?`[name=${r}]`:":not([name])");return((e,t,o)=>(o.configurable=!0,o.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,o),o))(t,o,{get(){const t=this.renderRoot?.querySelector(n);return t?.assignedNodes(e)??[]}})}}export{e as queryAssignedNodes};export default null;
//# sourceMappingURL=/sm/7fd3fb8bbb5880cd748341e1be656138204f140c9d7d3836f5ce9aff5efd9143.map