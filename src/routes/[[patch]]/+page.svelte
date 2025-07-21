<script lang="js">
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';

    let error = "";
    
    let patches = $state([
        {
            id: 'f537',
            file: './f537.ips',
            nameAddendum: 'nes-fixes-f537',
            name: 'NES fixes/tweaks #f537',
            description: `A patch implementing a number of NES game updates.  Asking for testers before submitting to Total for inclusion in the official builds.  I\'m requesting you play this <a href="https://en.wikipedia.org/wiki/Blinded_experiment">blind</a> (no release notes) to help me best guage what to work on next.
            <p>Feedback encouraged <a href="https://discord.com/channels/567470487483973652/638112063780159499">on Discord</a>.  Thank you for testing!</p>`,
        },
        {
            id: 'xray',
            file: './xray.ips',
            nameAddendum: 'xray-mirage',
            name: 'X-ray Mirage Mode',
            description: 'A challenge mod for your quad seed.  Link and Samus are suffering hallucinations from dehydration, and most items look like the much-maligned x-ray scope.',
        },
    ]);

    let chosenPatch = $state(patches.find(p => p.id == page.params.patch)?.id || '');
    
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
        const query = page.url.searchParams;
        const qsValue = query.get('p');

        if (qsValue && patches.filter(p => p.id == qsValue)?.length > 0) {
            chosenPatch = qsValue;
        }
    });

    $effect(() => {
        const curPatch = patches.find(p => p.id === chosenPatch);

        if(!curPatch)
            return;

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
                    const outFileName = `${baseName}.appatch-${curPatch.nameAddendum}`;
                    romFile.setName(outFileName);
                }
            }, {
                file: curPatch.file,
                name: curPatch.name,
                description: curPatch.description,
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

    <form>
        <div class="patchChooser">
            <label for="patch">Select a patch:</label>

            {#snippet content()}
                <button><selectedcontent>Quad rando patch</selectedcontent></button>
            {/snippet}

            <select id="patch" bind:value={chosenPatch} autofocus={!chosenPatch}>
                {@render content()}
                {#each patches as patch}
                    <option value={patch.id}>{@html patch.name}</option>
                {/each}
            </select>
        </div>

	<div id="rom-patcher-container" class:visible={chosenPatch}>
        {#if error}
            <p style="color: red;">{error}</p>
        {/if}
		<div class="rom-patcher-row margin-bottom" id="rom-patcher-row-file-rom">
			<div class="text-right"><label for="rom-patcher-input-file-rom" data-localize="yes">Quad seed:</label></div>
			<div class="rom-patcher-container-input">
				<input type="file" id="rom-patcher-input-file-rom" class="empty seedfile" accept=".sfc,.smc" class:error />
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

    </form>
</main>

<style>
    :global(:root) {
        --transition-time: 0.1s;
    }

    /*  Select control styles  */
    select, ::picker(select) {
        appearance: base-select;
        
    }

    select {
        cursor: pointer;
        border: 2px solid #ddd;
        background: #eee;
        padding: 10px;
        transition: var(--transition-time);
        /* border-radius: 0.25rem 0.25rem 0 0; */

        min-width: 20rem;

        & option {
            display: flex;
            justify-content: flex-start;
            gap: 20px;

            border: 2px solid #ddd;
            background: #eee;
            padding: 10px;
            transition: var(--transition-time);
        }
    }

    option:first-of-type {
    border-radius: 8px 8px 0 0;
    }

    option:last-of-type {
    border-radius: 0 0 8px 8px;
    }

    option:not(option:last-of-type) {
    border-bottom: none;
    }

option .icon {
  font-size: 1.6rem;
  text-box: trim-both cap alphabetic;
}

option:hover {
  background: rgb(0, 123, 255);
  color: white;
}

option:checked {
  font-weight: bold;
}

option::checkmark {
  order: 1;
  margin-left: auto;
  content: "✔️";
  color: transparent;
  text-shadow: 0 0 0 rgb(0, 123, 255);
}

    ::picker(select) {
      border: none;
    }

    select:hover,
    select:focus {
        background: #ddd;
    }

    select::picker-icon {
        color: #999;
        transition: var(--transition-time) rotate;
    }

    select:open::picker-icon {
        rotate: 180deg;
    }

    select > .placeholder {
        color: #ddd;
    }
    /*  End select styles  */

    .patchChooser {
        display: flex;
        margin: 2rem 0;
        gap: 1rem;
        justify-content: center;
        align-items: center;
    }

    .test {
        background-color: rgb(0, 123, 255);
        color: white;
        padding: 1rem 3rem;
    }

    #rom-patcher-container {
        display: none;

        &.visible {
            display: block;
        }
    }

    #rom-patcher-patch-description {
        text-align: left;
    }

    select > .placeholder {
        display: none;
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
        transition: border-color var(--transition-time);
    }

    #rom-patcher-container input[type="file"].error {
        border-color: red;
    }

    #rom-patcher-container button {
        padding: 6px 2rem;
        font-size: 1em;
        font-weight: normal;
        border: 1px solid rgb(40, 167, 69);
        border-radius: 4px;
        background-color: rgb(40, 167, 69);
        color: white;
        cursor: pointer;
        transition: background-color var(--transition-time);

        &:hover {
            background-color: rgb(33, 136, 56);
        }
    }

    #rom-patcher-container button:disabled {
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
