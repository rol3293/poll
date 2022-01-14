import React from "react";
import Layout from "../components/Layout";
import web3 from "../ethereum/web3";
import factory from "../ethereum/factory";
import Poll from "../ethereum/poll";
import {Card, Loader} from "semantic-ui-react";

class MyPolls extends React.Component {
    state = {
        items: [],
        loading: true
    }

    async fetchItems(account) {
        const items = [];
        const polls = await factory.methods.getDeployedPolls().call();
        for (const address of polls) {
            const poll = Poll(address);
            const owner = await poll.methods.manager().call();
            if (account.toUpperCase() === owner.toUpperCase()) {
                const options = await poll.methods.getOptions().call();
                const votes = await poll.methods.getVotes().call();
                let totalVotes = 0;
                votes.forEach(e => {
                    totalVotes += e / 1;
                });
                items.push(
                    {
                        href: `/vote/${address}`,
                        header: await poll.methods.description().call(),
                        description: `Options: ${[...options]}`,
                        meta: 'total votes: ' + totalVotes
                    }
                );
            }
        }
        return items;
    }
    async componentDidMount() {
        window.ethereum.on('accountsChanged', async (accounts) => {
            this.setState({loading: true});
            const items = await this.fetchItems(accounts[0]);
            this.setState({loading: false, items});
        });
        const [account] = await web3.eth.getAccounts();
        const items = await this.fetchItems(account);

        this.setState({items, loading: false});
    }

    render() {
        const {items, loading} = this.state;
        return (
            <Layout>
                <h2>My Polls ({items.length}):</h2>
                <Loader active={loading} inline='centered'/>
                <Card.Group items={items} />
            </Layout>
        );
    }

    componentWillUnmount() {
        window.ethereum.removeAllListeners();
    }
}

export default MyPolls;
