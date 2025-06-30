<script lang="js">
    import { onMount } from "svelte";
    let error = "";

    const expectedSeedSize = 8388608;

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

    onMount(() => {
        try {
            RomPatcherWeb.initialize({
                language: 'en', //default: en
                requireValidation: false,
                fixChecksum: false,
                onloadrom: function (romFile, patch) {
                    if (romFile.fileSize !== expectedSeedSize) {
                        const sizeDiff = romFile.fileSize - expectedSeedSize;
                        error = `This file does not appear to be a valid quad rando seed (too ${sizeDiff > 0 ? "large" : "small"} by ${formatBytes(Math.abs(sizeDiff))}).`;
                        return;
                    }
                    else {
                        error = '';
                    }

                    //  Calculate output filename
                    const lastDotIndex = romFile.fileName.lastIndexOf(".");
                    const baseName =
                        lastDotIndex !== -1
                            ? romFile.fileName.substring(0, lastDotIndex)
                            : romFile.fileName;
                    const outFileName = `${baseName}.appatch-xray-mirage`;
                    romFile.setName(outFileName);
                }
            }, {
                file: './xray.ips',
                name: 'X-ray Mirage Mode',
                description: 'A challenge mod for your quad seed.  Link and Samus are suffering hallucinations from dehydration, and most items look like the much-maligned x-ray scope.',
            });
        } catch (err) {
            var message = err.message;
            if (/incompatible browser/i.test(message) || /variable RomPatcherWeb/i.test(message))
                message = 'Your browser is outdated and it is not compatible with this app.';

            document.getElementById('rom-patcher-container').innerHTML = message;
            document.getElementById('rom-patcher-container').style.color = 'red';
        }
    });
</script>

<svelte:head>
    <title>Quad Randomizer patcher</title>
    <link type="text/css" rel="stylesheet" href="./rom-patcher-js/style.css" media="all" />
    <script type="text/javascript" src="./rom-patcher-js/RomPatcher.webapp.js"></script>
</svelte:head>

<main on:dragover|preventDefault>
    <h1>Quad Randomizer quick patcher</h1>

	<div id="rom-patcher-container">
        {#if error}
            <p style="color: red;">{error}</p>
        {/if}
		<div class="rom-patcher-row margin-bottom" id="rom-patcher-row-file-rom">
			<div class="text-right"><label for="rom-patcher-input-file-rom" data-localize="yes">Quad seed:</label></div>
			<div class="rom-patcher-container-input">
				<input type="file" id="rom-patcher-input-file-rom" class="empty seedfile" accept=".sfc,.smc" class:error on:change={handleFileChange} />
			</div>
		</div>

		<div class="rom-patcher-row margin-bottom" id="rom-patcher-row-file-patch">
			<div class="text-right"><label for="rom-patcher-input-file-patch" data-localize="yes">Patch file:</label>
			</div>
			<div class="rom-patcher-container-input">
				<select id="rom-patcher-select-patch"></select>
			</div>
		</div>

		<div class="rom-patcher-row margin-bottom" id="rom-patcher-row-patch-description">
			<div class="text-right text-mono text-muted" data-localize="yes">Description:</div>
			<div id="rom-patcher-patch-description"></div>
		</div>

		<div class="text-center" id="rom-patcher-row-apply">
			<div id="rom-patcher-row-error-message" class="margin-bottom"><span id="rom-patcher-error-message"></span>
			</div>
			<button id="rom-patcher-button-apply" data-localize="yes" disabled>Apply patch</button>
		</div>
	</div>
</main>

<style>
    .test {
        background-color: rgb(0, 123, 255);
        color: white;
        padding: 1rem 3rem;
    }

    #rom-patcher-patch-description {
        text-align: left;
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

    main #rom-patcher-container .seedfile {
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
