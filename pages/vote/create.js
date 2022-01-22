import React from "react";
import Layout from "../../components/Layout";
import { Button, Form, Message, Checkbox, TextArea } from "semantic-ui-react";
import web3 from "../../ethereum/web3";
import factory from "../../ethereum/factory";

class Create extends React.Component {
    state = {
        title: '',
        description: '',
        isYesOrNo: false,
        options: [ '', '' ],
        loading: false,
        errorMsg: ''
    }

    onCheck = (event) => {
        setTimeout(() => {
            const checked = event.target.parentElement.classList.contains('checked');
            this.setState({ isYesOrNo: checked, options: ['Yes', 'No'] });
        }, 100);
    }

    onCreate = async (event) => {
        const { title, description, options } = this.state;

        this.setState({ loading: true, errorMsg: '' });

        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        try {
            await factory.methods.createPoll(title, description, options).send({
                from: account
            });
        } catch (err) {
            this.setState({ errorMsg: err.message })
        }

        this.setState({ loading: false });
    }

    onAddOption = (event) => {
        event.preventDefault();
        const options = this.state.options;
        options.push('');
        this.setState({ options });
    }

    onRemoveOption = (event) => {
        event.preventDefault();
        const options = this.state.options;
        if (options.length === 0)
            return;

        options.pop();
        this.setState({ options });
    }

    render() {
        return (
            <Layout>
                <h3>Create a poll</h3>
                <Form>

                    <Form.Field inline>
                        <label>Title</label>
                        <input
                            required
                            placeholder='title'
                            onChange={event => this.setState({ title: event.target.value })}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label>Description</label>
                        <TextArea
                            required
                            placeholder='description'
                            onChange={event => this.setState({ description: event.target.value })}
                        />
                        <span>To avoid paying excessive fees. Write down as little words as possible</span>
                    </Form.Field>

                    <br />
                    <h4>Options</h4>

                    <Form.Field>
                        <label>Yes or No Question</label>
                        <Checkbox
                            toggle
                            onChange={this.onCheck} />
                    </Form.Field>

                    <div hidden={this.state.isYesOrNo} style={{marginBottom: '10px'}}>
                        <Form.Field inline>
                            <Button 
                                color="green" 
                                onClick={this.onAddOption}
                            >Add</Button>
                            <Button 
                                color="red" 
                                onClick={this.onRemoveOption} 
                                disabled={this.state.options.length === 1}
                            >Remove</Button>
                        </Form.Field>

                        {this.state.options.map((option, index) => (
                            <Form.Field>
                                <label>{'Option ' + (index + 1)}</label>
                                <input required onChange={event => {
                                    const options = this.state.options;
                                    options[index] = event.target.value;
                                }}/>
                            </Form.Field>
                        ))}
                    </div>



                    <Button primary loading={this.state.loading} onClick={this.onCreate} disabled={this.state.loading}>Create!</Button>
                    <Message negative content={this.state.errorMsg} hidden={!this.state.errorMsg} />
                </Form>
            </Layout>
        );
    }
}

export default Create;
