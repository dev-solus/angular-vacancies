import { type Editor, EditorConfig } from '@ckeditor/ckeditor5-core';

export const defaultConfig : EditorConfig= {
   // plugins: [ MathType,  ],

    toolbar: {
        items: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'imageUpload',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo',
			'findAndReplace',
			'specialCharacters',
			'alignment',
			'code',
			'codeBlock',
			'fontBackgroundColor',
			'fontColor',
			'fontSize',
			'highlight',
			'horizontalLine',
			'fontFamily',
			'htmlEmbed',
			'imageInsert',
			'pageBreak',
			'removeFormat',
			'selectAll',
			'restrictedEditingException',
			'strikethrough',
			'superscript',
			'subscript',
			'style',
			'textPartLanguage',
			'todoList',
			'underline'
		]

    },
    language: 'fr',
    alignment: {
      options: ['left', 'center', 'right','justify']
    },
    image: {
      toolbar: [
        'imageTextAlternative',
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        'linkImage',
      ]
    },
    mediaEmbed: {
      previewsInData: true,
      toolbar: [
        'mediaEmbedTextAlternative',
        'mediaEmbedStyle:inline',
        'mediaEmbedStyle:block',
        'mediaEmbedStyle:side',
        'linkmediaEmbed',
      ]
    },

    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells'
      ],

    }
  }  as EditorConfig
