import { CKEditor5 } from "@ckeditor/ckeditor5-angular";

export const defaultConfigBloc : CKEditor5.Config= {
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        //'link',
        'bulletedList',
        'numberedList',
        'fontColor',
        'fontFamily',
        'fontSize',
        'fontBackgroundColor',
        //'findAndReplace',
        '|',
        'alignment',
       // 'outdent',
      //  'indent',
        'horizontalLine',
        'pageBreak',
        //'sourceEditing',
        '|',

        'blockQuote',
        //'insertTable',

        // 'undo',
        // 'redo',
      //  'mediaEmbed'
      ]
    },
    language: 'fr',
    alignment: {
      options: ['left', 'center', 'right','justify']
    },

    // mediaEmbed: {
    //   previewsInData: true,
    //   toolbar: [
    //     'mediaEmbedTextAlternative',
    //     'mediaEmbedStyle:inline',
    //     'mediaEmbedStyle:block',
    //     'mediaEmbedStyle:side',
    //    // 'linkmediaEmbed',
    //   ]
    // }

    // table: {
    //   contentToolbar: [
    //     'tableColumn',
    //     'tableRow',
    //     'mergeTableCells'
    //   ]
    // }
  }
