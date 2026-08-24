"""
Seed script — populates the DB with data matching the Stitch prototype screens
(Alex Mercer's dashboard, Tech Talk Weekly, Synthwave Lounge, moderation queue, etc).

Run with: python seed.py
"""

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.channel import Channel
from app.models.membership import Membership
from app.models.message import Message
from app.models.invitation import Invitation
from app.models.report import Report
from app.models.ban import Ban

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    alex = User(
        username="alex_m",
        email="alex@podclub.dev",
        display_name="Alex Mercer",
        bio="Audio engineer, podcast host, & synth enthusiast.",
        is_platform_admin=True,
    )
    alex.set_password("password123")

    sarah = User(
        username="sarah_j",
        email="sarah@podclub.dev",
        display_name="Sarah Sync",
        bio="UI designer & electronic music producer.",
    )
    sarah.set_password("password123")

    mike = User(
        username="mic_drop",
        email="mike@podclub.dev",
        display_name="Mike Drop",
        bio="DJ, sound designer, and vintage analog gear collector.",
    )
    mike.set_password("password123")

    toxic = User(username="ToxicGamer99", email="toxic@podclub.dev", display_name="Toxic Gamer")
    toxic.set_password("password123")

    jane = User(username="JaneSpams", email="jane@podclub.dev", display_name="Jane Spams")
    jane.set_password("password123")

    db.session.add_all([alex, sarah, mike, toxic, jane])
    db.session.flush()

    night_owl = Channel(
        name="Night Owl Mixes",
        slug="night-owl-mixes",
        category="Music",
        is_live=True,
        created_by_id=alex.id,
    )
    design_talk = Channel(
        name="Design Talk Radio", slug="design-talk-radio", category="Design", created_by_id=alex.id
    )
    founders = Channel(
        name="Founders Mastermind",
        slug="founders-mastermind",
        category="Business",
        is_private=True,
        created_by_id=alex.id,
    )
    tech_talk = Channel(
        name="Tech Talk Weekly",
        slug="tech-talk-weekly",
        category="Tech",
        created_by_id=alex.id,
        description="Deep dives into weekly tech news, frameworks, and developer culture.",
    )
    design_systems = Channel(
        name="Design Systems IRL",
        slug="design-systems-irl",
        category="Design",
        created_by_id=alex.id,
        description="Discussing the struggles and triumphs of maintaining large design systems.",
    )
    synthwave = Channel(
        name="Synthwave Lounge",
        slug="synthwave-lounge",
        category="Music",
        created_by_id=alex.id,
        description="Listening parties and production tips for synthwave producers.",
    )
    synthwave_beats = Channel(
        name="synthwave-beats",
        slug="synthwave-beats",
        category="Music",
        created_by_id=mike.id,
        is_live=True,
        description="The ultimate hub for discussing retrowave, synthwave, and 80s inspired electronic music production.",
    )

    db.session.add_all(
        [night_owl, design_talk, founders, tech_talk, design_systems, synthwave, synthwave_beats]
    )
    db.session.flush()

    memberships = [
        Membership(user_id=alex.id, channel_id=night_owl.id, role="member"),
        Membership(user_id=alex.id, channel_id=design_talk.id, role="member"),
        Membership(user_id=alex.id, channel_id=founders.id, role="member"),
        Membership(user_id=alex.id, channel_id=tech_talk.id, role="owner"),
        Membership(user_id=alex.id, channel_id=design_systems.id, role="owner"),
        Membership(user_id=alex.id, channel_id=synthwave.id, role="owner"),
        Membership(user_id=alex.id, channel_id=synthwave_beats.id, role="member"),
        Membership(user_id=mike.id, channel_id=synthwave_beats.id, role="owner"),
        Membership(user_id=sarah.id, channel_id=synthwave_beats.id, role="member"),
    ]
    db.session.add_all(memberships)

    db.session.add_all(
        [
            Invitation(channel_id=synthwave.id, invited_user_id=alex.id, invited_by_id=sarah.id),
        ]
    )

    db.session.add_all(
        [
            Message(
                channel_id=synthwave_beats.id,
                author_id=mike.id,
                body="Just dropped a new mix on the main channel. The transition at 14:20 is pure fire.",
            ),
            Message(
                channel_id=synthwave_beats.id,
                author_id=alex.id,
                body="Listening now! That bassline is serious. What synth did you use for that lead?",
            ),
            Message(
                channel_id=synthwave_beats.id,
                author_id=sarah.id,
                body="Found this crazy vintage analog setup at a thrift store today. Thinking about buying it for the studio.",
            ),
        ]
    )

    db.session.add_all(
        [
            Report(reported_user_id=toxic.id, channel_id=synthwave.id, reason="Hate Speech"),
            Report(reported_user_id=jane.id, channel_id=tech_talk.id, reason="Spam Links"),
        ]
    )

    rule_breaker = User(
        username="RuleBreaker01", email="rb01@podclub.dev", display_name="Rule Breaker"
    )
    rule_breaker.set_password("password123")
    troll_bot = User(username="TrollBot_X", email="trollbot@podclub.dev", display_name="Troll Bot")
    troll_bot.set_password("password123")
    db.session.add_all([rule_breaker, troll_bot])
    db.session.flush()

    db.session.add_all(
        [
            Ban(user_id=rule_breaker.id, banned_by_id=alex.id, reason="Repeated policy violations"),
            Ban(user_id=troll_bot.id, banned_by_id=alex.id, reason="Automated spam"),
        ]
    )

    db.session.commit()
    print("Seed complete. Login as alex@podclub.dev / password123")
