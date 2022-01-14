import React from "react";
import Layout from "../../components/Layout";
import web3 from "../../ethereum/web3";
import factory from "../../ethereum/factory";
import Poll from "../../ethereum/poll";
import {Button, Form, Message, Radio} from "semantic-ui-react";

class VoteIndex extends React.Component {
    state = {
        value: '0',
        loading: false,
        error: '',
        alreadyVoted: false,
        userIsOwner: false,
        isPaused: false
    }

    static async getInitialProps({query}) {
        const poll = Poll(query['address']);
        const votes = await poll.methods.getVotes().call();

        return {query, votes};
    }

    async getUserInfo() {
        const poll = Poll(this.props.query['address']);

        const [account] = await web3.eth.getAccounts();

        const alreadyVoted = await poll.methods.voted(account).call();
        const userIsOwner = await poll.methods.manager().call() === account;
        const isPaused = await poll.methods.closed().call();

        this.setState({alreadyVoted, userIsOwner, isPaused});
    }

    async componentDidMount() {
        window.ethereum.on('accountsChanged', async () => {
            await this.getUserInfo();
        });
        await this.getUserInfo();
    }

    onVote = async () => {
        this.setState({loading: true, error: ''});

        let accounts = await web3.eth.getAccounts();

        const verified = await factory.methods.voters(accounts[0]).call();
        if (!verified) {
            this.setState({error: 'This address is not verified', loading: false});
            return;
        }

        this.setState({loading: true});
        const poll = Poll(this.props.query['address']);
        try {
            await poll.methods.vote(this.state.value * 1).send({from: accounts[0]});
            this.setState({alreadyVoted: true});
        } catch (err) {
            this.setState({error: err.message});
        }
        this.setState({loading: false});
    }

    continuePoll = async () => {
        const [account] = await web3.eth.getAccounts();
        const poll = Poll(this.props.query['address']);
        await poll.methods.stop(true).send({from: account});
    }

    pausePoll = async () => {
        const [account] = await web3.eth.getAccounts();
        const poll = Poll(this.props.query['address']);
        await poll.methods.stop(false).send({from: account});
    }

    pickWinner = async () => {
        const [account] = await web3.eth.getAccounts();
        const poll = Poll(this.props.query['address']);
        this.setState({loading: true, error: ''});
        try {
            await poll.methods.getWinner().send({from: account});
        } catch (err) {
            this.setState({error: err.message});
        }
        this.setState({loading: false});
    }

    render() {
        const {query, votes} = this.props;
        const {loading, alreadyVoted, error, userIsOwner, isPaused} = this.state;

        return (
            <Layout>
                <h2>Vote</h2>
                <div>
                    Address:
                    <a
                        href={`https://rinkeby.etherscan.io/address/${query['address']}`}
                        target="_blank"
                    >{" " + query['address']}</a>
                </div>
                <br/>
                <Form>
                    <Form.Field>
                        <Radio
                            label={'Yes (' + votes[0] + ')'}
                            name='radioGroup'
                            value='0'
                            checked={this.state.value === '0'}
                            onChange={() => this.setState({value: '0'})}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Radio
                            label={'No (' + votes[1] + ')'}
                            name='radioGroup'
                            value='1'
                            checked={this.state.value === '1'}
                            onChange={() => this.setState({value: '1'})}
                        />
                    </Form.Field>
                </Form>
                <Button
                    primary
                    loading={loading}
                    disabled={alreadyVoted || isPaused || loading}
                    onClick={this.onVote}
                    style={{marginTop: '10px'}}>{alreadyVoted ? 'Already voted' : 'Vote'}</Button>
                {userIsOwner &&
                    <span>
                        <Button
                            disabled={loading}
                            loading={loading}
                            color='red'
                            onClick={!isPaused ? this.continuePoll : this.pausePoll}
                        >{isPaused ? 'Reopen' : 'Pause'}</Button>
                        <Button
                            disabled={loading}
                            loading={loading}
                            color='green'
                            onClick={this.pickWinner}
                        >Pick winner</Button>
                    </span>
                }
                <Message negative content='This poll is currently closed' hidden={!isPaused}/>
                <Message negative content={error} hidden={!error}/>
            </Layout>
        );
    }
}

export default VoteIndex;
