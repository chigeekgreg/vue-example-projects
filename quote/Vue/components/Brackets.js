app.component('brackets', {
    template:
        /*html*/
        `<div class="display">          
          <h3>Weight brackets to calculate shipping cost:</h3>
          <div v-if="list == null || list.length === 0">
            Free shipping for all !<br>&nbsp;<br>
          </div>
          <div v-else>
            <div v-if="!hasZero()" class="bracketgrid">
                <div>from</div>
                <div class="weight">
                    0 &nbsp;               
                    <div v-if="brackets[0]">
                        to {{ brackets[0].weight }} lbs 
                    </div>
                </div> 
                free shipping
            </div>
            <div v-for="(bracket, index) in list" class="bracketgrid">
                <div v-if="list[index+1]">from</div>
                <div v-else>over</div>
                <div class="weight"> {{ bracket.weight }}&nbsp;
                    <div v-if="brackets[index+1]">
                        to {{ brackets[index+1].weight }}&nbsp;
                    </div>
                    lbs 
                </div>
                <div>\${{ bracket.cost }}</div>
                <button class="removebutton" v-on:click="remove(bracket)">Remove</button>
            </div>
          </div>
          <hr>
          <div class="newbracket">
            <label for="weight">Weight:</label>&nbsp;<input size=4 id="weight" v-model="weight">&nbsp;
            <label for="cost">Cost:</label>&nbsp;<input id="cost" size=4 v-model="cost">&nbsp;
            <button v-on:click="newBracket()">Add new bracket</button>
          </div>
        </div>`,
    data() {
        return {
            brackets: null,
            weight: '',
            cost: ''
        }
    },
    methods: {
        async getBrackets() {
            var resp = await axios.get('http://localhost:3000/getBrackets')
            // console.log(resp.data);
            this.brackets = resp.data
        },
        async newBracket() {
            if (this.weight === '' || this.cost === '') {
                alert('Please fill in weight and cost.')
                return
            }
            var weight = parseInt(this.weight);
            if (isNaN(weight)) {
                alert('Weight must be an integer number.')
                return
            }
            var cost = parseFloat(this.cost);
            if (isNaN(cost)) {
                alert('Cost must be anumber.')
                return
            }
            let brackets = this.brackets
            let bracket = brackets.find(x => x.weight === weight)
            if (bracket) {
                bracket.cost = cost
            } else {
                brackets.push({ weight: weight, cost: cost })
            }
            var resp = await axios.post('http://localhost:3000/setBrackets', brackets)
            this.weight = ''
            this.cost = ''
            this.getBrackets()
        },
        async remove(bracket) {
            let brackets = []
            for (var b of this.brackets) {
                if (b !== bracket) {
                    brackets.push(b)
                }
            }
            var resp = await axios.post('http://localhost:3000/setBrackets', brackets)
            this.getBrackets()
        },
        hasZero() {
            if (this.brackets !== null && this.brackets.find(x => x.weight === 0)) return true;
            return false
        }
    },
    computed: {
        list() {
            if (this.brackets == null) {
                this.getBrackets()
            }
            return this.brackets
        }
    }
})