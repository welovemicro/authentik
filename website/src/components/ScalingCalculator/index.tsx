import React from "react";

// Assumption that users log in over a period of 15 minutes, and that each login process takes 10 seconds.
const estimateLogins = (users: number) => Math.ceil(users / 15.0 / 60.0) * 10;

export default class ScalingCalculator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: 0,
            logins: 0,
            loginsManuallyUpdated: false,
            recommendation: null,
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    updateLogins() {
        if (this.state.users <= 0) return false;
        if (this.state.logins <= 0 && !this.state.loginsManuallyUpdated) {
            this.setState({
                ["logins"]: estimateLogins(this.state.users),
            });
        }
        return true;
    }

    updateRecommendation() {
        if (!this.updateLogins()) return;

        const cpus = Math.max(1, Math.ceil(this.state.logins / 10));

        const recommendation = {
            setups: [
                {
                    id: "kubernetes-ram-optimized",
                    platform: "Kubernetes (RAM Optimized)",
                    replicas: Math.max(2, Math.ceil(cpus / 2)),
                    requests_cpu: 2,
                    requests_memory: 1.5,
                    gunicorn_workers: 3,
                    gunicorn_threads: 2,
                },
                {
                    id: "kubernetes-cpu-optimized",
                    platform: "Kubernetes (CPU Optimized)",
                    replicas: Math.max(2, cpus),
                    requests_cpu: 1,
                    requests_memory: 1,
                    gunicorn_workers: 2,
                    gunicorn_threads: 2,
                },
                {
                    id: "docker-compose",
                    platform: "Docker Compose on virtual machine",
                    cpus: cpus,
                    memory: cpus,
                    gunicorn_workers: cpus + 1,
                    gunicorn_threads: 2,
                },
            ],
            postgres: {
                cpus: Math.max(2, cpus / 4),
                ram: Math.max(4, cpus),
                storage_gb: Math.ceil(this.state.users / 25000),
            },
            redis: {
                cpus: Math.max(2, cpus / 4),
                ram: Math.max(2, cpus / 2),
            },
        };

        this.setState({
            ["recommendation"]: recommendation,
        });
    }

    handleInputChange(event) {
        const target = event.target;
        this.setState({
            [target.name]: target.value,
        });
        if (target.name === "logins") {
            this.setState({
                ["loginsManuallyUpdated"]: true,
            });
        }

        this.updateRecommendation();
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    renderRecommendation() {
        const recommendation = this.state.recommendation;
        if (recommendation === null) {
            return <></>;
        }
        return (
            <>
                <h3>Recommended setups</h3>
                <h4>authentik server</h4>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            {recommendation.setups.map((s, _) => {
                                return <th>{s.platform}</th>;
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ["replicas", "Replicas"],
                            ["requests_cpu", "CPU Requests"],
                            ["requests_memory", "Memory Requests (GB)"],
                            ["cpus", "CPUs"],
                            ["memory", "RAM (GB)"],
                            [
                                "gunicorn_workers",
                                '<a href="./configuration#authentik_web__workers">Gunicorn Workers</a>',
                            ],
                            [
                                "gunicorn_threads",
                                '<a href="./configuration#authentik_web__threads">Gunicorn Threads</a>',
                            ],
                        ].map((r, _) => {
                            return (
                                <tr>
                                    <th
                                        dangerouslySetInnerHTML={{
                                            __html: r[1],
                                        }}
                                    ></th>
                                    {recommendation.setups.map((s, _) => {
                                        if (!(r[0] in s)) return <td>N/A</td>;
                                        return <td>{s[r[0]]}</td>;
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <h4>Databases</h4>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>PostgreSQL</th>
                            <th>Redis</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>CPUs</th>
                            <td>{recommendation.postgres.cpus}</td>
                            <td>{recommendation.redis.cpus}</td>
                        </tr>
                        <tr>
                            <th>Memory (GB)</th>
                            <td>{recommendation.postgres.ram}</td>
                            <td>{recommendation.redis.ram}</td>
                        </tr>
                        <tr>
                            <th>Storage (GB)</th>
                            <td>{recommendation.postgres.storage_gb}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </>
        );
    }

    render() {
        return (
            <>
                <form>
                    <label>
                        Number of users
                        <input
                            type="number"
                            name="users"
                            value={this.state.users}
                            onChange={this.handleInputChange}
                            required
                        />
                    </label>
                    <br />
                    <label>
                        Number of concurrent logins
                        <input
                            type="number"
                            name="logins"
                            value={this.state.logins}
                            onChange={this.handleInputChange}
                        />
                    </label>
                </form>
                {this.renderRecommendation()}
            </>
        );
    }
}
