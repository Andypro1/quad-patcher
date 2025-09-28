<script>
    import NesChrRenderer from "./NesChrRenderer.svelte";
    import LinkAssets from "../data/link-assets";
    import SamusAssets from "../data/samus-assets";

    export let selectedIndex; // asset index bound in parent
    export let assetType = "link";

    //  Props
    let dialogRef;

    const openDialog = (index) => {
        dialogRef.showModal();

        const selected = dialogRef.querySelector('input[type="radio"]:checked');

        if (selected) {
            // Scroll into view
            selected.scrollIntoView({ block: "center", behavior: "instant" });

            // Focus its label so keyboard users are right on it
            selected.closest("label")?.focus();
        } else {
            // If nothing selected, focus first card
            dialogRef.querySelector(".image-option")?.focus();
        }
    };

    const closeDialog = () => {
        dialogRef.close();
    };

    const keydownDialog = (e) => {
        const focusable = Array.from(dialogRef.querySelectorAll(".image-option"));
        const current = document.activeElement.closest(".image-option");
        const index = focusable.indexOf(current);

        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            const next = focusable[(index + 1) % focusable.length];
            if (next) next.focus();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            const prev =
                focusable[(index - 1 + focusable.length) % focusable.length];
            if (prev) prev.focus();
        } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const radio = current?.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                selectedIndex = +radio.value;
                dialogRef.close();
            }
        } else if (e.key === "Escape") {
            e.preventDefault();
            dialogRef.close();
        }
    };

    // expose openDialog() to parent via bind:this
    export { openDialog, closeDialog };
</script>

{#if assetType === "link"}
    <dialog
        class="assetDialog"
        bind:this={dialogRef}
        on:change={(e) => {
            selectedIndex = +e.target.value;
            dialogRef.close();
        }}
        on:click={(e) => {
            if (e.target.type === "radio" && e.target.checked) {
                selectedIndex = +e.target.value;
                dialogRef.close();
            }
        }}
        on:keydown={keydownDialog}
    >
        <form method="dialog" class="dialog-form">
            <div class="image-grid">
                {#each LinkAssets as linkAsset, i}
                    <label class="image-option" tabindex="0">
                        <input type="radio" name="asset" value={i} bind:group={selectedIndex} />
                        <NesChrRenderer
                            assetType="link"
                            b64String={linkAsset.writes[2].base64}
                            paletteString={linkAsset.writes[7].base64}
                        ></NesChrRenderer>
                        <div class="caption">{linkAsset.name}</div>
                    </label>
                {/each}
            </div>
        </form>
    </dialog>
{:else}
    <dialog
        class="assetDialog"
        bind:this={dialogRef}
        on:change={(e) => {
            selectedIndex = +e.target.value;
            dialogRef.close();
        }}
        on:click={(e) => {
            if (e.target.type === "radio" && e.target.checked) {
                selectedIndex = +e.target.value;
                dialogRef.close();
            }
        }}
        on:keydown={keydownDialog}
    >
        <form method="dialog" class="dialog-form">
            <div class="image-grid samus">
                {#each SamusAssets as samusAsset, i}
                    <label class="image-option" tabindex="0">
                        <input type="radio" name="asset" value={i} bind:group={selectedIndex}  />
                        <NesChrRenderer
                            assetType="samus"
                            b64Run2Head={samusAsset.writes[0].base64}
                            Run2HeadStart={2}
                            Run2HeadEnd={4}
                            b64Run2Shoulders={samusAsset.writes[11].base64}
                            Run2ShouldersStart={2}
                            Run2ShouldersEnd={4}
                            b64Run2Torso={samusAsset.writes[5].base64}
                            Run2TorsoStart={2}
                            Run2TorsoEnd={4}
                            b64Run2Legs={samusAsset.writes[8].base64}
                            Run2LegsStart={1}
                            Run2LegsEnd={4}
                            paletteString={samusAsset.writes[18].base64}
                        ></NesChrRenderer>
                        <div class="caption">{samusAsset.name}</div>
                    </label>
                {/each}
            </div>
        </form>
    </dialog>
{/if}

<style>
    .caption {
        font-variant: small-caps;
        margin-bottom: auto;
    }

    .image-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
        gap: 1rem;

        &.samus {
            grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
        }
    }

    .image-option {
        position: relative;
        display: flex;
        flex-direction: column;
        margin-inline: auto;

        cursor: pointer;
        border: 2px solid transparent;
        border-radius: 6px;
        padding: 6px;

        line-height: 1;
        transition: border 0.1s;

        &:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
        }
    }

    .image-option input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
    }

    .assetDialog {
        background: #f0f0f0;
        background: linear-gradient(
            291deg,
            rgba(240, 240, 240, 1) 0%,
            rgba(200, 200, 200, 1) 100%
        );
        border: none;
        border-radius: 8px;
        padding: 1rem;
        min-width: 80vw;
        max-height: 80vh;
        overflow-y: auto;
        overflow-x: hidden;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .dialog-form {
        margin: 0; /* prevent default form margins */
    }

    /* dim background when open */
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.4);
    }
</style>
