import React from "react";
import Layout from "../components/Layout";
import factory from "../ethereum/factory";
import Poll from "../ethereum/poll";
import {Card, Loader} from "semantic-ui-react";
import web3 from "../ethereum/web3";
import {EventEmitter} from "events";

const ethEvent = new EventEmitter();

class Index extends React.Component {
    state = {
        loading: true,
        items: []
    }

    async componentDidMount() {
        const polls = await factory.methods.getDeployedPolls().call();

        const items = [];
        for (const e of polls) {
            const poll = Poll(e);
            const options = await poll.methods.getOptions().call();
            const votes = await poll.methods.getVotes().call();
            let totalVotes = 0;
            votes.forEach(e => {
                totalVotes += e/1;
            });
            items.push(
                {
                    href: `/vote/${e}`,
                    header: await poll.methods.description().call(),
                    description: `Options: ${[...options]}`,
                    meta: 'total votes: ' + totalVotes
                }
            );
        }
        this.setState({items, loading: false});
    }

    render() {
        const {items, loading} = this.state;
        return (
            <Layout>
                <h2>
                    Welcome to the ethereum poll generator!
                </h2>
                <h3>View polls</h3>
                <Loader active={loading} inline='centered' />
                <div hidden={loading}>
                    Total polls deployed: {items.length}
                </div>
                <br />
                <Card.Group items={items} />
            </Layout>
        );
    }

    componentWillUnmount() {
        ethEvent.removeAllListeners();
    }
}

export default Index;
