import { createRequire } from "module";

const require = createRequire(import.meta.url);

// eslint-config-next ships a native flat config array in v16+
const nextConfig = require("eslint-config-next");

export default [...nextConfig];
