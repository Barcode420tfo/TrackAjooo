// TrackAjo Waitlist Landing Page - Pure JavaScript with React

// API base URL. Set window.TRACKAJO_API_BASE before this script to override.
var VITE_API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || '';
var IS_LOCAL = window.location.hostname === 'localhost';
var API_BASE = window.TRACKAJO_API_BASE
    || VITE_API_BASE
    || (IS_LOCAL ? 'http://localhost:5000' : '');

function parseResponse(res) {
    return res.text().then(function(text) {
        var data = {};
        if (text) {
            try {
                data = JSON.parse(text);
            } catch (e) {
                data = {};
            }
        }

        if (!res.ok) {
            throw new Error(data.message || ('Request failed (' + res.status + ')'));
        }

        return data;
    });
}

// ============ Navbar Component ============
function Navbar(props) {
    var waitlistCount = props.waitlistCount;
    return React.createElement('nav', { className: 'navbar navbar-custom fixed-top' },
        React.createElement('div', { className: 'container d-flex justify-content-between align-items-center' },
            React.createElement('div', { className: 'navbar-brand-text' },
                'Track', React.createElement('span', null, 'Ajo')
            ),
            waitlistCount > 0 ? React.createElement('div', { className: 'nav-waitlist-count' },
                React.createElement('i', { className: 'bi bi-people-fill me-1' }),
                waitlistCount.toLocaleString(), ' on waitlist'
            ) : null
        )
    );
}

// ============ Signup Form Component ============
function SignupForm() {
    var emailState = React.useState('');
    var email = emailState[0];
    var setEmail = emailState[1];

    var phoneState = React.useState('');
    var phone = phoneState[0];
    var setPhone = phoneState[1];

    var loadingState = React.useState(false);
    var loading = loadingState[0];
    var setLoading = loadingState[1];

    var successState = React.useState(false);
    var success = successState[0];
    var setSuccess = successState[1];

    var errorState = React.useState('');
    var error = errorState[0];
    var setError = errorState[1];

    function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!API_BASE) {
            setError('Service unavailable: API URL is not configured.');
            return;
        }

        if (!email.trim() && !phone.trim()) {
            setError('Please enter your email or phone number.');
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);

        fetch(API_BASE + '/api/waitlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), phone: phone.trim() })
        })
        .then(parseResponse)
        .then(function(data) {
            setLoading(false);
            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.message || 'Something went wrong. Please try again.');
            }
        })
        .catch(function(err) {
            setLoading(false);
            setError(err && err.message ? err.message : 'Unable to connect. Please try again later.');
        });
    }

    if (success) {
        return React.createElement('div', { className: 'signup-card fade-in-up' },
            React.createElement('div', { className: 'success-message' },
                React.createElement('div', { className: 'success-icon' },
                    React.createElement('i', { className: 'bi bi-check-circle-fill' })
                ),
                React.createElement('div', { className: 'success-title' }, "You're on the list!"),
                React.createElement('div', { className: 'success-text' },
                    "Thank you! We'll notify you when we launch. Get ready to transform your savings experience."
                )
            )
        );
    }

    return React.createElement('div', { className: 'signup-card fade-in-up-delay-2' },
        React.createElement('div', { className: 'signup-card-title' }, 'Join the Waitlist'),
        React.createElement('div', { className: 'signup-card-subtitle' }, 'Be the first to experience TrackAjo.'),
        error ? React.createElement('div', { className: 'error-message' },
            React.createElement('i', { className: 'bi bi-exclamation-circle me-1' }), error
        ) : null,
        React.createElement('form', { onSubmit: handleSubmit },
            React.createElement('div', { className: 'mb-3' },
                React.createElement('label', { className: 'form-label-custom' }, 'Email Address'),
                React.createElement('input', {
                    type: 'email',
                    className: 'form-control form-control-custom',
                    placeholder: 'you@example.com',
                    value: email,
                    onChange: function(e) { setEmail(e.target.value); }
                })
            ),
            React.createElement('div', { className: 'mb-3' },
                React.createElement('label', { className: 'form-label-custom' }, 'Phone Number'),
                React.createElement('input', {
                    type: 'tel',
                    className: 'form-control form-control-custom',
                    placeholder: '+234 800 000 0000',
                    value: phone,
                    onChange: function(e) { setPhone(e.target.value); }
                })
            ),
            React.createElement('button', {
                type: 'submit',
                className: 'btn btn-signup',
                disabled: loading
            },
                loading
                    ? React.createElement('span', null,
                        React.createElement('span', { className: 'spinner-border spinner-border-sm me-2' }),
                        'Joining...'
                    )
                    : React.createElement('span', null,
                        'Join the Waitlist ',
                        React.createElement('i', { className: 'bi bi-arrow-right ms-1' })
                    )
            )
        ),
        React.createElement('div', { className: 'text-center mt-3' },
            React.createElement('small', { style: { color: '#A0AEC0', fontSize: '0.8rem' } },
                React.createElement('i', { className: 'bi bi-lock-fill me-1' }),
                'We respect your privacy. No spam, ever.'
            )
        )
    );
}

// ============ Hero Section ============
function HeroSection() {
    return React.createElement('section', { className: 'hero-section' },
        React.createElement('div', { className: 'container' },
            React.createElement('div', { className: 'row align-items-center' },
                React.createElement('div', { className: 'col-lg-6 mb-4 mb-lg-0' },
                    React.createElement('div', { className: 'hero-badge fade-in-up' },
                        React.createElement('i', { className: 'bi bi-stars' }),
                        ' Coming Soon'
                    ),
                    React.createElement('h1', { className: 'hero-title fade-in-up' },
                        'Your Ajo. ', React.createElement('br', null),
                        React.createElement('span', { className: 'highlight' }, 'Now Digital.')
                    ),
                    React.createElement('p', { className: 'hero-subtitle fade-in-up-delay-1' },
                        'TrackAjo brings your trusted savings circle online. Contribute, track, and receive payouts \u2014 all in one secure place. No more guesswork, no more missed payments. Just a smarter way to save together.'
                    ),
                    React.createElement('div', { className: 'd-flex gap-3 flex-wrap fade-in-up-delay-1' },
                        React.createElement('div', { className: 'd-flex align-items-center gap-2' },
                            React.createElement('i', { className: 'bi bi-shield-check', style: { color: '#3E92CC' } }),
                            React.createElement('small', { style: { color: '#B8C9E0' } }, 'Bank-level security')
                        ),
                        React.createElement('div', { className: 'd-flex align-items-center gap-2' },
                            React.createElement('i', { className: 'bi bi-lightning-charge', style: { color: '#3E92CC' } }),
                            React.createElement('small', { style: { color: '#B8C9E0' } }, 'Automated payouts')
                        ),
                        React.createElement('div', { className: 'd-flex align-items-center gap-2' },
                            React.createElement('i', { className: 'bi bi-graph-up-arrow', style: { color: '#3E92CC' } }),
                            React.createElement('small', { style: { color: '#B8C9E0' } }, 'Real-time tracking')
                        )
                    )
                ),
                React.createElement('div', { className: 'col-lg-6' },
                    React.createElement('div', { className: 'hero-image-wrapper d-flex justify-content-center' },
                        React.createElement(SignupForm, null)
                    )
                )
            )
        )
    );
}

// ============ Features Section ============
function FeaturesSection() {
    var features = [
        {
            icon: 'bi-shield-lock',
            color: 'blue',
            title: 'Secure & Transparent',
            text: 'Every contribution is tracked on a real-time ledger. Funds are held in regulated escrow accounts \u2014 your money is always safe.'
        },
        {
            icon: 'bi-arrow-repeat',
            color: 'green',
            title: 'Automated Payouts',
            text: "When it's your turn, payouts happen automatically. No chasing, no delays, no manual transfers."
        },
        {
            icon: 'bi-people',
            color: 'purple',
            title: 'Group Management',
            text: 'Create or join savings circles easily. Invite members, set contribution rules, and let TrackAjo handle the rest.'
        },
        {
            icon: 'bi-phone',
            color: 'orange',
            title: 'Save From Anywhere',
            text: "No need to meet in person. Contribute from wherever you are, whenever it's convenient."
        }
    ];

    return React.createElement('section', { className: 'features-section', id: 'features' },
        React.createElement('div', { className: 'container' },
            React.createElement('h2', { className: 'section-title' }, 'Why TrackAjo?'),
            React.createElement('p', { className: 'section-subtitle' },
                "We're building the tools to make your savings circle work better \u2014 for everyone."
            ),
            React.createElement('div', { className: 'row g-4' },
                features.map(function(feature, index) {
                    return React.createElement('div', { className: 'col-md-6 col-lg-3', key: index },
                        React.createElement('div', { className: 'feature-card' },
                            React.createElement('div', { className: 'feature-icon ' + feature.color },
                                React.createElement('i', { className: 'bi ' + feature.icon })
                            ),
                            React.createElement('h5', { className: 'feature-title' }, feature.title),
                            React.createElement('p', { className: 'feature-text' }, feature.text)
                        )
                    );
                })
            )
        )
    );
}

// ============ How It Works Section ============
function HowItWorksSection() {
    var steps = [
        {
            num: '1',
            title: 'Create or Join a Circle',
            text: 'Start a new savings group or get invited to an existing one.'
        },
        {
            num: '2',
            title: 'Contribute Regularly',
            text: 'Make contributions through your dedicated virtual account \u2014 tracked in real time.'
        },
        {
            num: '3',
            title: 'Receive Your Payout',
            text: "When it's your turn, funds are automatically transferred to your bank account."
        }
    ];

    return React.createElement('section', { className: 'how-section', id: 'how-it-works' },
        React.createElement('div', { className: 'container' },
            React.createElement('div', { className: 'row align-items-center' },
                React.createElement('div', { className: 'col-lg-5 mb-4 mb-lg-0 text-center' },
                    React.createElement('img', {
                        src: 'https://mgx-backend-cdn.metadl.com/generate/images/762012/2026-03-05/f5b160de-57e8-4d50-a339-bd65abb1a57d.png',
                        alt: 'Community savings',
                        className: 'how-image'
                    })
                ),
                React.createElement('div', { className: 'col-lg-6 offset-lg-1' },
                    React.createElement('h2', { className: 'section-title text-start mb-4' }, 'How It Works'),
                    React.createElement('p', { className: 'section-subtitle text-start mb-4', style: { marginLeft: 0 } },
                        'Simple, straightforward, and built around the way you already save.'
                    ),
                    steps.map(function(step, index) {
                        return React.createElement('div', { className: 'step-item', key: index },
                            React.createElement('div', { className: 'step-number' }, step.num),
                            React.createElement('div', null,
                                React.createElement('div', { className: 'step-title' }, step.title),
                                React.createElement('div', { className: 'step-text' }, step.text)
                            )
                        );
                    })
                )
            )
        )
    );
}

// ============ CTA Section ============
function CTASection() {
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return React.createElement('section', { className: 'cta-section' },
        React.createElement('div', { className: 'container' },
            React.createElement('img', {
                src: 'https://mgx-backend-cdn.metadl.com/generate/images/762012/2026-03-05/8ed900f4-5265-4864-a3be-05349656b4d5.png',
                alt: 'Digital savings',
                className: 'cta-image'
            }),
            React.createElement('h2', { className: 'cta-title' }, 'Ready to Save Smarter?'),
            React.createElement('p', { className: 'cta-text' },
                'Join thousands who are waiting to transform their savings experience. Be part of the future of Ajo.'
            ),
            React.createElement('button', {
                className: 'btn btn-signup',
                style: { width: 'auto', padding: '14px 40px' },
                onClick: scrollToTop
            },
                'Join the Waitlist ',
                React.createElement('i', { className: 'bi bi-arrow-up ms-1' })
            )
        )
    );
}

// ============ Footer ============
function Footer() {
    var currentYear = new Date().getFullYear();

    return React.createElement('footer', { className: 'footer' },
        React.createElement('div', { className: 'container' },
            React.createElement('div', { className: 'row align-items-center' },
                React.createElement('div', { className: 'col-md-6 mb-3 mb-md-0' },
                    React.createElement('div', { className: 'navbar-brand-text mb-2', style: { fontSize: '1.2rem' } },
                        'Track', React.createElement('span', { style: { color: '#3E92CC' } }, 'Ajo')
                    ),
                    React.createElement('p', { className: 'footer-text mb-0' },
                        '\u00A9 ' + currentYear + ' TrackAjo. All rights reserved.'
                    )
                ),
                React.createElement('div', { className: 'col-md-6 text-md-end' },
                    React.createElement('div', { className: 'footer-links d-flex gap-3 justify-content-md-end' },
                        React.createElement('a', { href: '#features' }, 'Features'),
                        React.createElement('a', { href: '#how-it-works' }, 'How It Works'),
                        React.createElement('a', { href: 'mailto:hello@trackajo.com' }, 'Contact')
                    )
                )
            )
        )
    );
}

// ============ App Component ============
function App() {
    var countState = React.useState(0);
    var waitlistCount = countState[0];
    var setWaitlistCount = countState[1];

    React.useEffect(function() {
        if (!API_BASE) {
            return;
        }

        fetch(API_BASE + '/api/waitlist/count')
            .then(parseResponse)
            .then(function(data) {
                if (data.success) {
                    setWaitlistCount(data.count);
                }
            })
            .catch(function() {
                // Silently fail - count just won't show
            });
    }, []);

    return React.createElement(React.Fragment, null,
        React.createElement(Navbar, { waitlistCount: waitlistCount }),
        React.createElement(HeroSection, null),
        React.createElement(FeaturesSection, null),
        React.createElement(HowItWorksSection, null),
        React.createElement(CTASection, null),
        React.createElement(Footer, null)
    );
}

// ============ Render ============
var root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App, null));
