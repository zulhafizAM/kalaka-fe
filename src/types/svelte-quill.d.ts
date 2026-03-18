declare module 'svelte-quill' {
    import { SvelteComponentTyped } from 'svelte';
    
    export interface QuillEditorProps {
      value?: string;
      theme?: string;
      readOnly?: boolean;
      placeholder?: string;
      modules?: Record<string, any>;
    }
  
    export default class QuillEditor extends SvelteComponentTyped<QuillEditorProps> {}
  }
  