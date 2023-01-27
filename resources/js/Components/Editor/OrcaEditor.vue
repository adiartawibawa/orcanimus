<script setup>
import Quill from "quill";
import Parchment from "parchment";
import { onMounted, ref } from "vue";

import ImageUploader from "./ImageUploader.vue";
import HTMLEmbedder from "./HTMLEmbedder.vue";
import OrcaImageBlot from "./OrcaImageBlot.js";
import DividerBlot from "./OrcaDividerBlot.js";
import HTMLBlot from "./HTMLBlot.js";
import OrcaClipboard from "./OrcaClipboard.js";
import OrcaLink from "./OrcaLink.js";
import iconQuill from "~/quill/assets/icons/header-3.svg";

let editorial = ref(null);
let editor = ref(null);

const controlIsActive = ref(false);

const props = defineProps({
    value: {
        type: String,
        default: "",
    },
    postId: {
        type: String,
    },
});

const emit = defineEmits([
    "input",
    "openingHTMLEmbedder",
    "openingImageUploader",
]);

onMounted(async () => {
    await Promise.all([createEditor(), handleEditorValue()]);

    handleClicksInsideEditor();
    initSideControls();
});

/**
 * Create an instance of the editor.
 */
const createEditor = () => {
    // register embed here
    Quill.register(OrcaImageBlot, true);
    Quill.register(DividerBlot, true);
    Quill.register(HTMLBlot, true);
    Quill.register(OrcaLink, true);
    Quill.register("modules/clipboard", OrcaClipboard, true);

    let quill = new Quill(editorial.value, {
        modules: {
            syntax: false,
            toolbar: [
                ["bold", "italic", "underline", "strike", "code"],
                [{ header: "2" }, { header: "3" }],
                [{ list: "ordered" }, { list: "bullet" }, "link"],
                ["blockquote", "code-block"],
            ],
        },
        theme: "bubble",
        scrollingContainer: "html, body",
        placeholder: "Tell Your Story",
    });

    return (editor = quill);
};

/**
 * Handle the editor value.
 */
const handleEditorValue = () => {
    editor.root.innerHTML = props.value;

    editor.on("text-change", () => {
        emit("input", editor.getText() ? editor.root.innerHTML : "");
    });
};

/**
 * Handle click events inside the editor.
 */
const handleClicksInsideEditor = () => {
    editor.root.addEventListener("click", (ev) => {
        let blot = Parchment.find(ev.target, true);

        if (blot instanceof OrcaImageBlot) {
            var values = blot.value(blot.domNode)["captioned-image"];

            values.existingBlot = blot;

            this.openImageUploader(values);
        }

        if (blot instanceof HTMLBlot) {
            var values = blot.value(blot.domNode)["html"];

            values.existingBlot = blot;

            this.openingHTMLEmbedder(values);
        }
    });
};

/**
 * Init the side controls.
 */
const initSideControls = () => {
    let Block = Quill.import("blots/block");

    editor.on(Quill.events.EDITOR_CHANGE, (eventType, range) => {
        let sidebarControls = document.getElementById("sidebar-controls");

        if (eventType !== Quill.events.SELECTION_CHANGE) return;

        if (range == null) return;

        if (range.length === 0) {
            let [block, offset] = editor.scroll.descendant(Block, range.index);

            if (
                block != null &&
                block.domNode.firstChild instanceof HTMLBRElement
            ) {
                let lineBounds = editor.getBounds(range);

                sidebarControls.classList.remove("active");

                sidebarControls.style.display = "block";

                sidebarControls.style.left = lineBounds.left - 50 + "px";
                sidebarControls.style.top = lineBounds.top - 2 + "px";
            } else {
                sidebarControls.style.display = "none";

                sidebarControls.classList.remove("active");
            }
        } else {
            sidebarControls.style.display = "none";

            sidebarControls.classList.remove("active");
        }
    });
};

/**
 * Show the side controls.
 */
const showSideControls = () => {
    document.getElementById("sidebar-controls").classList.toggle("active");

    editor.focus();
};

const openingHTMLEmbedder = (data = null) => {
    emit("openingHTMLEmbedder", data);
};

const openImageUploader = (data = null) => {
    emit("openingImageUploader", data);
};

/**
 * Add a new captioned image to the content.
 */
const applyImage = ({ url, caption, existingBlot, layout }) => {
    let values = {
        url: url,
        caption: caption,
        layout: layout,
    };

    if (existingBlot) {
        return existingBlot.replaceWith("captioned-image", values);
    }

    let range = editor.getSelection(true);

    editor.insertEmbed(
        range.index,
        "captioned-image",
        values,
        Quill.sources.USER
    );

    editor.setSelection(range.index + 1, Quill.sources.SILENT);
};

/**
 * Add a divider to the content.
 */
const addDivider = () => {
    let range = editor.getSelection(true);

    editor.insertText(range.index, "\n", Quill.sources.USER);
    editor.insertEmbed(range.index + 1, "divider", true, Quill.sources.USER);
    editor.setSelection(range.index + 2, Quill.sources.SILENT);
};

/**
 * Add a new HTML blot to the content.
 */
const applyHTML = ({ content, existingBlot }) => {
    let values = {
        content: content,
    };

    let range = editor.getSelection(true);

    if (existingBlot) {
        return existingBlot.replaceWith("html", values);
    }

    editor.insertEmbed(range.index, "html", values, Quill.sources.USER);

    editor.setSelection(range.index + 1, Quill.sources.SILENT);
};
</script>

<template>
    <div style="position: relative" class="mx-10">
        <div id="sidebar-controls">
            <button
                id="show-controls"
                class="rounded-full w-8 h-8 border border-light text-light hover:bg-light hover:text-contrast text-center"
                @click="showSideControls"
            >
                +
            </button>

            <div class="controls hidden pl-4 bg-contrast">
                <button @click="openImageUploader()">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        class="fill-current w-3"
                    >
                        <path
                            d="M0 4c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm11 9l-3-3-6 6h16l-5-5-2 2zm4-4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
                        />
                    </svg>
                </button>
                <button @click="openingHTMLEmbedder()">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        class="fill-current w-3"
                    >
                        <path
                            d="M.7 9.3l4.8-4.8 1.4 1.42L2.84 10l4.07 4.07-1.41 1.42L0 10l.7-.7zm18.6 1.4l.7-.7-5.49-5.49-1.4 1.42L17.16 10l-4.07 4.07 1.41 1.42 4.78-4.78z"
                        />
                    </svg>
                </button>
                <button @click="addDivider">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        class="fill-current w-3"
                    >
                        <path
                            d="M4 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm6 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm6 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
                        />
                    </svg>
                </button>
            </div>
        </div>

        <div ref="editorial"></div>

        <ImageUploader post-id="postId" @updated="applyImage" />
        <HTMLEmbedder post-id="postId" @adding="applyHTML" />
    </div>
</template>
