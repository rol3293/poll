import React from "react";
import Layout from "../../components/Layout";
import {Button, Form, Message} from "semantic-ui-react";
import web3 from "../../ethereum/web3";
import factory from "../../ethereum/factory";

class Create extends React.Component {
    state = {
        description: '',
        firstOption: '',
        secondOption: '',
        loading: false,
        errorMsg: ''
    }

    onCreate = async (event) => {
        event.preventDefault();

        const { description, firstOption, secondOption } = this.state;

        this.setState({ loading: true, errorMsg: '' });

        const [account] = await web3.eth.getAccounts();
        try {
            await factory.methods.createPoll(description, [firstOption, secondOption]).send({
                from: account
            });
        } catch (err) {
            this.setState({ errorMsg: err.message })
        }

        this.setState({ loading: false });
    }

    render() {
        return (
            <Layout>
                <h3>Create a poll</h3>
                <Form>
                    <Form.Field inline>
                        <label>Description</label>
                        <input
                            required
                            placeholder='description'
                            onChange={event => this.setState({ description: event.target.value })}
                        />
                    </Form.Field>

                    <br />
                    <h4>Options</h4>

                    <Form.Field inline>
                        <label>Option 1</label>
                        <input
                            required
                            placeholder='option'
                            onChange={event => this.setState({ firstOption: event.target.value })}
                        />
                    </Form.Field>
                    <Form.Field inline>
                        <label>Option 2</label>
                        <input
                            required
                            placeholder='option'
                            onChange={event => this.setState({ secondOption: event.target.value })}
                        />
                    </Form.Field>
                    <Button primary loading={this.state.loading} onClick={this.onCreate}>Create!</Button>
                    <Message negative content={this.state.errorMsg} hidden={!this.state.errorMsg}/>
                </Form>
            </Layout>
        );
    }
}

export default Create;
