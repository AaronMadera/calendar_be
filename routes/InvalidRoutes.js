class InvalidRoutes {
    constructor ($app) {
        this.app = $app;

        this.Routes();
    }

    Routes() {
        this.app.get('*', (req, res) => res.status(404).json({ error: true, msg: 'Invalid GET request' }));

        this.app.post('*', (req, res) => res.status(404).json({ error: true, msg: 'Invalid POST request' }));

        this.app.put('*', (req, res) => res.status(404).json({ error: true, msg: 'Invalid PUT request' }));

        this.app.patch('*', (req, res) => res.status(404).json({ error: true, msg: 'Invalid PATCH request' }));

        this.app.delete('*', (req, res) => res.status(404).json({ error: true, msg: 'Invalid DELETE request' }));
    }
}

module.exports = InvalidRoutes;
