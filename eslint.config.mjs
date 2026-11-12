import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
    ...nextVitals,
    {
        rules: {
            "react/no-unescaped-entities": "off",
            "react-hooks/exhaustive-deps": "off",
        },
    },
    {
        ignores: [
            ".next/**",
            ".open-next/**",
            ".wrangler/**",
            "cloudflare/dist/**",
            "node_modules/**",
        ],
    },
];

export default config;
