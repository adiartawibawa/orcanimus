<script setup>
import Quill from 'quill';
import Parchment from 'parchment';
import { onMounted, ref } from 'vue';

let quill;
const editor = ref(null);

const props = defineProps({
    value: {
        type: String,
        default: ''
    }
})

const initialize = () => {

    quill = new Quill(editor.value, {
        modules: {
            toolbar: [
                [{ header: [1, 2, 3, 4, false] }],
                ['bold', 'italic', 'underline']
            ]
        },
        theme: 'snow',
        formats: ['bold', 'underline', 'header', 'italic'],
        placeholder: "Type something in here!"
    })

    quill.root.innerHTML = props.value;
    quill.on('text-change', () => update());
}

const update = () => {
    $emit('input', quill.getText() ? quill.root.innerHTML : '');
}

onMounted(() => {
    initialize();
})

</script>

<template>
    <div style="position: relative">
        <div id="sidebar-controls"></div>
        <div ref="editor"></div>
    </div>
</template>


<style lang="css">
@import '~/quill/dist/quill.core.css';
@import '~/quill/dist/quill.snow.css';
</style>