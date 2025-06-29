<script lang="js">
    import { onMount } from "svelte";
    let file = null;
    let error = "";
    let modifiedBlob = null;

    const expectedSeedSize = 8388608;

    function handleFileChange(event) {
        const input = event.target;
        if (input.files && input.files[0]) {
            validateAndModify(input.files[0]);
        }
        else {
            file = null;
            modifiedBlob = null;
            error = "";
        }
    }

    function handleDrop(event) {
        // event.preventDefault();
        if (event.dataTransfer?.files[0]) {
            validateAndModify(event.dataTransfer.files[0]);
        }
    }

    function validateAndModify(selectedFile) {
        error = "";

        if (selectedFile.size !== expectedSeedSize) {
            file = null;
            modifiedBlob = null;

            const sizeDiff = selectedFile.size - expectedSeedSize;
            error = `This file does not appear to be a valid quad rando seed (too ${sizeDiff > 0 ? "large" : "small"} by ${formatBytes(Math.abs(sizeDiff))}).`;
            return;
        }
        file = selectedFile;

        const reader = new FileReader();
        reader.onload = () => {
            if (!(reader.result instanceof ArrayBuffer)) return;
            const buffer = new Uint8Array(reader.result);
            buffer.set([0x00, 0x01, 0x02, 0x03, 0x04], 0);
            modifiedBlob = new Blob([buffer], {
                type: "application/octet-stream",
            });
        };
        reader.readAsArrayBuffer(file);
    }

    function triggerDownload() {
        if (!modifiedBlob || !file) return;

        const url = URL.createObjectURL(modifiedBlob);
        const a = document.createElement("a");
        a.href = url;

        const lastDotIndex = file.name.lastIndexOf(".");
        const baseName =
            lastDotIndex !== -1
                ? file.name.substring(0, lastDotIndex)
                : file.name;
        const extension =
            lastDotIndex !== -1 ? file.name.substring(lastDotIndex) : "";
        a.download = `${baseName}.appatch-xray-mirage${extension}`;

        a.click();
        URL.revokeObjectURL(url);
    }

    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return "0 Bytes";

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = [
            "Bytes",
            "KiB",
            "MiB",
            "GiB",
            "TiB",
            "PiB",
            "EiB",
            "ZiB",
            "YiB",
        ];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }
</script>

<svelte:head>
    <title>Quad Randomizer patcher</title>
</svelte:head>

<main on:drop={handleDrop} on:dragover|preventDefault>
    <h1>Select a quad rando seed</h1>
    <p class="test">Quad Randomizer - v0.1.11b</p>
    <input type="file" accept=".sfc,.smc" class:error on:change={handleFileChange} />
    {#if error}
        <p style="color: red;">{error}</p>
    {/if}
    <button
        on:click={triggerDownload}
        title={modifiedBlob
            ? "Download the patched file"
            : "Select a file first"}
        disabled={!modifiedBlob}>Download</button
    >
</main>

<style>
    .test {
        background-color: rgb(0, 123, 255);
        color: white;
        padding: 1rem 3rem;
    }

    h1 {
        font-size: 1.8rem;
        margin-bottom: 1rem;
    }

    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            "Open Sans",
            "Helvetica Neue",
            sans-serif;
        gap: 1.5rem;
        text-align: center;
    }

    input[type="file"] {
        border: 2px dashed rgb(223, 223, 223);
        padding: 2rem;
        border-radius: 8px;
        cursor: pointer;
        width: 100%;
        max-width: 400px;
        transition: border-color 0.3s;
    }

    input[type="file"].error {
        border-color: red;
    }

    button {
        padding: 6px 2rem;
        font-size: 1em;
        font-weight: normal;
        border: 1px solid rgb(40, 167, 69);
        border-radius: 4px;
        background-color: rgb(40, 167, 69);
        color: white;
        cursor: pointer;
        transition: background-color 0.3s;

        &:hover {
            background-color: rgb(33, 136, 56);
        }
    }

    button:disabled {
        background-color: rgb(223, 223, 223);
        border-color: rgb(223, 223, 223);
        cursor: not-allowed;
    }

    @media (max-width: 600px) {
        input[type="file"],
        button {
            width: 90%;
        }
    }
</style>
