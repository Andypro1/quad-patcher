<script>
    import NesChrRenderer from "./NesChrRenderer.svelte";
    import LinkAssets from "../data/link-assets";
    import SamusAssets from "../data/samus-assets";
    import AssetDialog from "./AssetDialog.svelte";
    import { assetState } from "../lib/selected-sprites-store";
    import { onMount } from "svelte";

    let linkDialog;
    let samusDialog;
    let linkAssetIndex = 0;
    let samusAssetIndex = 0;
    let mounted = false;

    // Sync store whenever `selected` changes
    $: assetState.update(state => typeof(linkAssetIndex) === 'number' ? ({ ...state, linkAsset: LinkAssets[linkAssetIndex] }) : state);
    $: assetState.update(state => typeof(samusAssetIndex) === 'number' ? ({ ...state, samusAsset: SamusAssets[samusAssetIndex] }) : state);

    onMount(() => {
        const link  = localStorage.getItem('linkAssetIndex');
        const samus = localStorage.getItem('samusAssetIndex');

        if (link !== null) {
            linkAssetIndex = +link;
        }

        if (samus !== null) {
            samusAssetIndex = +samus;
        }

        mounted = true;
    });

    $: if (mounted) {
        localStorage.setItem('linkAssetIndex', linkAssetIndex);
        localStorage.setItem('samusAssetIndex', samusAssetIndex);
    }

    //  Generate data assets above with the following scripts:
    //  python .\convert-all-z1m1-assets.py --base-offsets "0=0x608DB4,1=0x61007F" --data-dir "C:\Users\virtue\Downloads\z1m1\zelda\link" --tilemap "D:\Projects\lozmx\launcher\MM.RomStudio.Engines.Zelda\Resources\Link\TileMap.xml" > "D:\Projects\multirando-asm\dev\link-assets.js"
    //  python .\convert-all-z1m1-assets.py --base-offsets "0=0x6b0000" --data-dir "C:\Users\virtue\Downloads\z1m1\metroid\samus" --tilemap "D:\Projects\lozmx\launcher\MM.RomStudio.Engines.Metroid\Resources\Samus\TileMap.Normal-Set0.xml" > "D:\Projects\multirando-asm\dev\samus-assets.js"
</script>

<AssetDialog bind:selectedIndex={linkAssetIndex} bind:this={linkDialog} assetType="link"></AssetDialog>
<AssetDialog bind:selectedIndex={samusAssetIndex} bind:this={samusDialog} assetType="samus"></AssetDialog>

<h2>Customizations</h2>

<section class="customization">
    <div>
        <label for="zeldaButton">Zelda 1, play as</label>
        {#if mounted}
            <button id="zeldaButton" class="assetPreview image-option preview" on:click|preventDefault={linkDialog.openDialog}>
                {#if typeof(linkAssetIndex) === 'number'}
                    <NesChrRenderer
                        b64String={LinkAssets[linkAssetIndex].writes[2].base64}
                        paletteString={LinkAssets[linkAssetIndex].writes[7].base64}
                    ></NesChrRenderer>
                    <div class="caption">{LinkAssets[linkAssetIndex].name}</div>
                {/if}
            </button>
        {:else}
            <div class="buttonPlaceholder"></div>
        {/if}
        <input type="hidden" name="linkAsset" id="assetValue" bind:value={linkAssetIndex} />
    </div>

    <div>
        <label for="samusButton">Metroid 1, play as</label>
        {#if mounted}
            <button id="samusButton" class="assetPreview image-option preview" on:click|preventDefault={samusDialog.openDialog}>
                {#if typeof(samusAssetIndex) === 'number'}
                    <NesChrRenderer
                        assetType="samus"
                        b64Run2Head={SamusAssets[samusAssetIndex].writes[0].base64}
                        Run2HeadStart={2}
                        Run2HeadEnd={4}
                        b64Run2Shoulders={SamusAssets[samusAssetIndex].writes[11].base64}
                        Run2ShouldersStart={2}
                        Run2ShouldersEnd={4}
                        b64Run2Torso={SamusAssets[samusAssetIndex].writes[5].base64}
                        Run2TorsoStart={2}
                        Run2TorsoEnd={4}
                        b64Run2Legs={SamusAssets[samusAssetIndex].writes[8].base64}
                        Run2LegsStart={1}
                        Run2LegsEnd={4}
                        paletteString={SamusAssets[samusAssetIndex].writes[18].base64}
                    ></NesChrRenderer>
                    <div class="caption">{SamusAssets[samusAssetIndex].name}</div>
                {/if}
            </button>
        {:else}
            <div class="buttonPlaceholder"></div>
        {/if}
        <input type="hidden" name="samusAsset" id="assetValue" bind:value={samusAssetIndex} />
    </div>

    <footer>Credit: MetalMachine and the asset creators from the <a href="https://z1m1.info/">z1m1 project</a></footer>
</section>

<style>
    footer {
        grid-column: 1 / 3;
        font-style: italic;
        font-size: 1rem;
    }

    .buttonPlaceholder { 
        cursor: pointer;
        display: flex;
        align-items: center;
        min-width: 120px;
        border: 2px solid #ccc;
        border-radius: 6px;
        padding: 8px;
        box-sizing: border-box;
        background: #f0f0f0;
        min-height: 200px;
    }

    .customization {
        display: grid;
        grid-template-columns: 1fr 1fr;
        justify-items: center;

        background-color: rgb(249, 250, 250);
        margin: 1rem 0;
        padding: 1rem;
        gap: 1rem;
        row-gap: 2rem;

        & > div {
            max-width: 150px;

            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            justify-content: space-between;
            align-items: center;

            & > * {
                flex: 0 1 auto;
            }
        }
    }

    .preview:focus-within {
        border: 2px solid #000;
    }

    button.preview {
        all: unset; /* strip default button styles */
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
        justify-content: center;

        min-width: 120px;
        min-height: 222px;
        border: 2px solid #ccc;
        border-radius: 6px;
        padding: 8px;
        box-sizing: border-box;

        background: #f0f0f0;
    }


    /* Default thumbnail style */
    :global(.image-option svg) {
        height: auto;
        display: block;
        border-radius: 6px;
        border: 2px solid transparent;
        transition:
            border 0.1s,
            transform 0.1s;
    }

    .caption {
        font-variant: small-caps;
        /* margin-bottom: auto; */
    }

    /* Hover feedback */
    :global(.image-option:hover) {
        border: 2px solid rgba(0 123 255 / 0.2);
    }

    :global(.image-option:hover svg) {
        transform: scale(1.1);
    }
</style>
