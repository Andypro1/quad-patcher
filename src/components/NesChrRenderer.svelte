<script>
    import { onMount } from "svelte";

    // Props
    export let b64String     = "";
    export let paletteString = "";
    export let assetType ="link";
    export let b64Run2Head = "";
    export let Run2HeadStart = "";
    export let Run2HeadEnd = "";
    export let b64Run2Shoulders = "";
    export let Run2ShouldersStart = "";
    export let Run2ShouldersEnd = "";
    export let b64Run2Torso = "";
    export let Run2TorsoStart = "";
    export let Run2TorsoEnd = "";
    export let b64Run2Legs = "";
    export let Run2LegsStart = "";
    export let Run2LegsEnd = "";

    // Define color codes for pixel values 0-3
    const _2c07Colors = [
        "#626262", //null, // transparent
        "#002263",
        "#0d107d",
        "#2b027d",

        "#440063",
        "#530036",
        "#530502",
        "#441500",

        "#2b2700",
        "#0d3600",
        "#003e00",
        "#003d02",

        "#003336",
        null, // $0d - forbidden
        "#000000",
        "#000000",

        "#ababab",
        "#1251a8",
        "#3438cb",
        "#5c24cb",

        "#7e19a8",
        "#921b6b",
        "#922924",
        "#7e3f00",

        "#5c5700",
        "#346b00",
        "#127600",
        "#007424",

        "#00676b",
        "#000000",
        "#000000",
        "#000000",

        "#ffffff",
        "#62a1fa",
        "#8589ff",
        "#ac75ff",

        "#cf6afa",
        "#e36cbc",
        "#e37975",
        "#cf9037",

        "#aca814",
        "#85bc14",
        "#62c737",
        "#4ec575",

        "#4eb7bc",
        "#4e4e4e",
        "#000000",
        "#000000",

        "#ffffff",
        "#c4ddff",
        "#d1d3ff",
        "#e1cbff",

        "#efc7ff",
        "#f6c8e7",
        "#f6cdcb",
        "#efd6b3",

        "#e1dfa6",
        "#d1e7a6",
        "#c4ebb3",
        "#bcebcb",

        "#bce5e7",
        "#b8b8b8",
        "#000000",
        "#000000",
    ];

    const decodePaletteBase64 = (b64) => {
        // Base64 → binary string
        const binStr = atob(b64);

        // Convert to Uint8Array of raw bytes
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) {
            bytes[i] = binStr.charCodeAt(i);
        }

        return bytes; // e.g. Uint8Array(3)
    };

    const decodeChrBase64 = (b64, start, end) => {
        // Decode base64 → binary string
        const binStr = atob(b64);

        // Convert to Uint8Array of raw bytes
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) {
            bytes[i] = binStr.charCodeAt(i);
        }

        const tiles = [];

        // NES tiles are 16 bytes each
        for (let t = 0; t < bytes.length; t += 16) {
            const tileBytes = bytes.subarray(t, t + 16);
            const pixels = new Uint8Array(64); // 8x8

            for (let y = 0; y < 8; y++) {
                const plane0 = tileBytes[y];
                const plane1 = tileBytes[y + 8];
                for (let x = 0; x < 8; x++) {
                    const mask = 0x80 >> x;
                    const lo = plane0 & mask ? 1 : 0;
                    const hi = plane1 & mask ? 2 : 0;
                    pixels[y * 8 + x] = lo | hi; // 0–3
                }
            }

            tiles.push(pixels);
        }

        //  If a start and end are specified, return only those tiles.  Otherwise return all decoded tiles
        return start ? tiles.slice(start, end) : tiles;
    };

    const decodeXflippedChrBase64 = (b64, start, end) => {
        // Decode base64 → binary string
        const binStr = atob(b64);

        // Convert to Uint8Array of raw bytes
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) {
            bytes[i] = binStr.charCodeAt(i);
        }

        const tiles = [];

        // NES tiles are 16 bytes each
        for (let t = 0; t < bytes.length; t += 16) {
            const tileBytes = bytes.subarray(t, t + 16);
            const pixels = new Uint8Array(64); // 8x8

            for (let y = 0; y < 8; y++) {
                const plane0 = tileBytes[y];
                const plane1 = tileBytes[y + 8];
                for (let x = 0; x < 8; x++) {
                    const mask = 0x80 >> x;
                    const lo = plane0 & mask ? 1 : 0;
                    const hi = plane1 & mask ? 2 : 0;
                    pixels[y * 8 + (7-x)] = lo | hi; // 0–3
                }
            }

            tiles.push(pixels);
        }

        //  If a start and end are specified, return only those tiles.  Otherwise return all decoded tiles
        return start ? tiles.slice(start, end) : tiles;
    };

    const createSvg = (b64Str, palStr) => {
        const tiles = decodeChrBase64(b64Str);
        const palette = decodePaletteBase64(palStr);
        const tileSize = 8;
        const scale = 5;
        const numTiles = Math.min(4, tiles.length);
        const cols = 2;
        const rows = Math.ceil(numTiles / cols);

        let svgContent = "";

        // Add shape-rendering='crispEdges' to prevent gaps between pixels
        let svgParts = [
            `<svg xmlns='http://www.w3.org/2000/svg' width='${cols * tileSize * scale}' height='${rows * tileSize * scale}' shape-rendering='crispEdges'>`,
        ];

        const order = [0, 2, 1, 3]; // swap tiles 1 and 2

        order.slice(0, numTiles).forEach((tileIndex, i) => {
            const tile = tiles[tileIndex];
            const col = i % cols;
            const row = Math.floor(i / cols);
            for (let idx = 0; idx < 64; idx++) {
                const val = tile[idx];
                const color = _2c07Colors[palette[val - 1]];
                if (!color) continue;
                const x = (col * tileSize + (idx % tileSize)) * scale;
                const y = (row * tileSize + Math.floor(idx / tileSize)) * scale;
                svgParts.push(
                    `<rect x='${x}' y='${y}' width='${scale}' height='${scale}' fill='${color}' />`,
                );
            }
        });

        svgParts.push("</svg>");
        svgContent = svgParts.join("\n");

        return svgContent;
    };

    const createMetroidSvg = (b64Run2Head,
    Run2HeadStart,
    Run2HeadEnd,
    b64Run2Shoulders,
    Run2ShouldersStart,
    Run2ShouldersEnd,
    b64Run2Torso,
    Run2TorsoStart,
    Run2TorsoEnd,
    b64Run2Legs,
    Run2LegsStart,
    Run2LegsEnd, palStr) => {
        const headTiles = decodeChrBase64(b64Run2Head, Run2HeadStart, Run2HeadEnd);
        const shouldersTiles = decodeXflippedChrBase64(b64Run2Shoulders, Run2ShouldersStart, Run2ShouldersEnd);
        const torsoTiles = decodeChrBase64(b64Run2Torso, Run2TorsoStart, Run2TorsoEnd);
        const legsTiles = decodeChrBase64(b64Run2Legs, Run2LegsStart, Run2LegsEnd);
                
        const tiles = headTiles.concat(shouldersTiles).concat(torsoTiles).concat(legsTiles);
        const palette = decodePaletteBase64(palStr);
        const tileSize = 8;
        const scale = 4;
        const numTiles = Math.min(9, tiles.length);
        const cols = 3;
        const rows = Math.ceil(numTiles / cols);

        let svgContent = "";

        // Add shape-rendering='crispEdges' to prevent gaps between pixels
        let svgParts = [
            `<svg xmlns='http://www.w3.org/2000/svg' width='${cols * tileSize * scale}' height='${4 * tileSize * scale}' shape-rendering='crispEdges'>`,
        ];

        const order = [0, 1, 3, 2, 4, 5, 6, 7, 8];

        order.slice(0, numTiles).forEach((tileIndex, i) => {
            const tile = tiles[tileIndex];
            const col = i === 8 ? 2 : i % 2;
            const row = Math.min(Math.floor(i / 2), 3);
            for (let idx = 0; idx < 64; idx++) {
                const val = tile[idx];
                const color = _2c07Colors[palette[val - 1]];
                if (!color) continue;
                const x = (col * tileSize + (idx % tileSize)) * scale;
                const y = (row * tileSize + Math.floor(idx / tileSize)) * scale;
                svgParts.push(
                    `<rect x='${x}' y='${y}' width='${scale}' height='${scale}' fill='${color}' />`,
                );
            }
        });

        svgParts.push("</svg>");
        svgContent = svgParts.join("\n");

        return svgContent;
    };
</script>

{#if assetType === 'link'}
    {@html createSvg(b64String, paletteString)}
{:else}
    {@html createMetroidSvg(b64Run2Head,
    Run2HeadStart,
    Run2HeadEnd,
    b64Run2Shoulders,
    Run2ShouldersStart,
    Run2ShouldersEnd,
    b64Run2Torso,
    Run2TorsoStart,
    Run2TorsoEnd,
    b64Run2Legs,
    Run2LegsStart,
    Run2LegsEnd, paletteString)}
{/if}