app.component('secret-note', {
    template:
        /*html*/
        `<div class="lineitem">         
            <input id="notetext" v-model="text" :disabled="!note.status||mode=='process'||mode=='all'">  &nbsp;                                       
            <div v-if="mode=='open'||mode=='final'">
                <span v-if="note.status" v-on:click="update()" class="fas fa-check"></span>               
                <span v-else v-on:click="note.status=true" class="fas fa-wrench"></span>                         
                &nbsp;<span v-on:click="remove()" class="fas fa-trash"></span>  
            </div>                       
         </div>`,
    props: {
        note: {
            type: Object,
            required: true
        },
        mode: {
            type: String,
            required: true
        }
    },    
    data() {
        return {
            text: this.note.text,
        }
    },
    methods: {
        update() { 
            this.note.text = this.text
            this.$emit('update', this.note)  
            this.note.status = false     
        },
        remove() {
            this.$emit('remove', this.note)
        }
    }
})