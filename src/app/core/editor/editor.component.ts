import { LocalService } from './../../core/user/local.service';
import { Component, forwardRef, inject, Input, OnDestroy, OnInit } from '@angular/core';
import CustomEditor from './ckeditor.js';
import { type Editor, EditorConfig } from '@ckeditor/ckeditor5-core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
// import CustomEditorFull from './full/ck/ckeditor';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { defaultConfig } from './config';
import { MyUploadAdapter } from './MyUploadAdapter';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
    standalone: true,
    imports: [
        CommonModule,

        FormsModule,
        ReactiveFormsModule,
        CKEditorModule,

    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => EditorComponent)
        },
    ]
})
export class EditorComponent implements OnInit, ControlValueAccessor {
    Editor: any = CustomEditor;
    readonly session = inject(LocalService);

    @Input() ckeConfig = defaultConfig as EditorConfig;
    //
    obj = new FormControl('');
    disabled = false;
    onChange = (obj) => { };
    onTouched = () => { };



    async ngOnInit() {
        this.obj.valueChanges.subscribe(r => {
            setTimeout(() => {

                this.onTouched();
                this.onChange(r);
            }, 10);
        });
    }

    writeValue(obj: any): void {
        this.obj.setValue(obj, {emitEvent: false});
    }

    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onReady(editor: Editor) {

        (editor.plugins.get('FileRepository') as any  ).createUploadAdapter = (loader) => new MyUploadAdapter(loader,this.session);


        editor.ui
            .getEditableElement()
            .parentElement.insertBefore(
                (editor.ui.view as any).toolbar.element,
                editor.ui.getEditableElement()
            );

    }
}
