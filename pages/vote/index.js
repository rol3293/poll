import React from "react";
import Layout from "../../components/Layout";
import web3 from "../../ethereum/web3";
import factory from "../../ethereum/factory";
import Poll from "../../ethereum/poll";
import { Button, Form, Message, Radio } from "semantic-ui-react";

class VoteIndex extends React.Component {
    state = {
        value: 0,
        loading: false,
        error: '',
        alreadyVoted: false,
        userIsOwner: false,
        title: '',
        description: '',
        votes: [],
        options: [],
        manager: '',
        paused: false,
        closed: false,
        winner: -1
    }

    static async getInitialProps({ query }) {
        return { query };
    }

    async getPollInfo(poll) {
        const [account] = await web3.eth.getAccounts();

        const alreadyVoted = await poll.methods.voted(account).call();
        const summary = await poll.methods.getSummary().call();
        const manager = summary[0];
        const title = summary[1];
        const description = summary[2];
        const paused = summary[3];
        const closed = summary[4];
        const winner = summary[5];
        const options = summary[6];
        const votes = summary[7];
        const userIsOwner = manager === account;
        this.setState({ alreadyVoted, userIsOwner, manager, title, description, paused, closed, winner, options, votes });
    }

    async componentDidMount() {
        // get data about the poll
        const poll = Poll(this.props.query['address']);
        window.ethereum.on('accountsChanged', async () => {
            await this.getPollInfo(poll);
        });
        await this.getPollInfo(poll);

        // listener for vote
        poll.events.VoteEvent().on('data', (event) => {
            const { option, newValue } = event.returnValues;
            let votes = [...this.state.votes];
            votes[parseInt(option)] = newValue;
            this.setState({ votes });
        });

        // listener for pause
        poll.events.PauseEvent().on('data', (event) => {
            const { newState } = event.returnValues;
            this.setState({ paused: newState });
        });

        // listener for when a winner selected
        poll.events.GetWinnerEvent().on('data', (event) => {
            const { winner } = event.returnValues;
            this.setState({ winner, closed: true });
        });
    }

    onVote = async () => {
        this.setState({ loading: true, error: '' });

        let accounts = await web3.eth.getAccounts();

        const verified = await factory.methods.voters(accounts[0]).call();
        if (!verified) {
            this.setState({ error: 'This address is not verified', loading: false });
            return;
        }

        this.setState({ loading: true });
        const poll = Poll(this.props.query['address']);
        try {
            await poll.methods.vote(this.state.value).send({ from: accounts[0] });
            this.setState({ alreadyVoted: true });
        } catch (err) {
            this.setState({ error: err.message });
        }
        this.setState({ loading: false });
    }

    continuePoll = async () => {
        const [account] = await web3.eth.getAccounts();
        const poll = Poll(this.props.query['address']);
        await poll.methods.pause(true).send({ from: account });
    }

    pausePoll = async () => {
        const [account] = await web3.eth.getAccounts();
        const poll = Poll(this.props.query['address']);
        await poll.methods.pause(false).send({ from: account });
    }

    pickWinner = async () => {
        const [account] = await web3.eth.getAccounts();
        const poll = Poll(this.props.query['address']);
        this.setState({ loading: true, error: '' });
        try {
            await poll.methods.getWinner().send({ from: account });
        } catch (err) {
            this.setState({ error: err.message });
        }
        this.setState({ loading: false });
    }

    render() {
        const { query } = this.props;
        const { loading, error, alreadyVoted, userIsOwner, manager, paused, closed, options, votes, winner, title, description } = this.state;

        return (
            <Layout>
                <h2>{title}</h2>
                <p>{description}</p>
                <div>
                    Address:
                    <a
                        href={`https://rinkeby.etherscan.io/address/${query['address']}`}
                        target="_blank"
                    >{" " + query['address']}</a>
                </div>
                <div>
                    Owner:
                    <a
                        href={`https://rinkeby.etherscan.io/address/${manager}`}
                        target="_blank"
                    >{" " + manager}</a>
                </div>
                <br />
                <Form>
                    {options.map((option, index) => (
                        <Form.Field>
                            <Radio
                                disabled={paused}
                                label={option + ' (' + votes[index] + ')'}
                                name='radioGroup'
                                value={index}
                                checked={this.state.value === index}
                                onChange={() => this.setState({ value: index })}
                            />
                        </Form.Field>
                    ))}
                </Form>
                <Button
                    primary
                    loading={loading}
                    disabled={alreadyVoted || paused || loading}
                    onClick={this.onVote}
                    style={{ marginTop: '10px' }}>{alreadyVoted ? 'Already voted' : 'Vote'}</Button>
                {(userIsOwner && !closed) &&
                    <span>
                        <Button
                            disabled={loading}
                            loading={loading}
                            color='red'
                            onClick={!paused ? this.continuePoll : this.pausePoll}
                        >{paused ? 'Reopen' : 'Pause'}</Button>
                        <Button
                            disabled={loading}
                            loading={loading}
                            color='green'
                            onClick={this.pickWinner}
                        >Pick winner</Button>
                    </span>
                }
                <Message positive content={`The winner is ${options[winner]}`} hidden={!closed}/>
                <Message negative content='This poll is currently closed' hidden={(false && true)} />
                <Message negative content={error} hidden={!error} />
            </Layout>
        );
    }
}

export default VoteIndex;
