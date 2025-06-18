-- Table des utilisateurs
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url VARCHAR(255),
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    elo_rating INTEGER DEFAULT 1200
);

-- Table des matchs/parties
CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_id INTEGER NOT NULL,
    player2_id INTEGER NOT NULL,
    player1_score INTEGER DEFAULT 0,
    player2_score INTEGER DEFAULT 0,
    winner_id INTEGER,
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    tournament_id INTEGER,
    FOREIGN KEY (player1_id) REFERENCES users(id),
    FOREIGN KEY (player2_id) REFERENCES users(id),
    FOREIGN KEY (winner_id) REFERENCES users(id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

-- Table des tournois
CREATE TABLE tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    max_participants INTEGER DEFAULT 8,
    current_participants INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'registration', -- registration, in_progress, completed, cancelled
    registration_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registration_end TIMESTAMP,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    winner_id INTEGER,

    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (winner_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table des participants aux tournois
CREATE TABLE tournament_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    seed_number INTEGER,
    is_eliminated BOOLEAN DEFAULT FALSE,
    final_position INTEGER,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(tournament_id, user_id)
);

-- Table des rounds/tours de tournoi
CREATE TABLE tournament_rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    round_number INTEGER NOT NULL,
    round_name VARCHAR(50), -- Quarter-finals, Semi-finals, Final, etc.
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    UNIQUE(tournament_id, round_number)
);

-- Table des classements/leaderboards
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_elo ON users(elo_rating DESC);
CREATE INDEX idx_matches_players ON matches(player1_id, player2_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_user ON tournament_participants(user_id);

-- Triggers pour maintenir les statistiques à jour
CREATE TRIGGER update_user_stats_after_match
AFTER UPDATE OF status ON matches
WHEN NEW.status = 'completed' AND OLD.status != 'completed'
BEGIN
    -- Mise à jour des statistiques du gagnant
    UPDATE users SET
        wins = wins + 1,
        total_games = total_games + 1,
        elo_rating = CASE
            WHEN NEW.winner_id = users.id THEN elo_rating + 20
            ELSE elo_rating
        END
    WHERE id = NEW.winner_id;

    -- Mise à jour des statistiques du perdant
    UPDATE users SET
        losses = losses + 1,
        total_games = total_games + 1,
        elo_rating = CASE
            WHEN NEW.winner_id != users.id THEN
                CASE
                    WHEN elo_rating > 10 THEN elo_rating - 10
                    ELSE 0
                END
            ELSE elo_rating
        END
    WHERE id IN (NEW.player1_id, NEW.player2_id) AND id != NEW.winner_id;
END;

-- Trigger pour mettre à jour le timestamp updated_at
CREATE TRIGGER update_users_timestamp
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger pour mettre à jour le nombre de participants dans les tournois
CREATE TRIGGER update_tournament_participants_count
AFTER INSERT ON tournament_participants
BEGIN
    UPDATE tournaments
    SET current_participants = (
        SELECT COUNT(*) FROM tournament_participants
        WHERE tournament_id = NEW.tournament_id
    )
    WHERE id = NEW.tournament_id;
END;

CREATE TRIGGER decrease_tournament_participants_count
AFTER DELETE ON tournament_participants
BEGIN
    UPDATE tournaments
    SET current_participants = (
        SELECT COUNT(*) FROM tournament_participants
        WHERE tournament_id = OLD.tournament_id
    )
    WHERE id = OLD.tournament_id;
END;

-- Données d'exemple pour tester
INSERT INTO users (username, email, password_hash, avatar_url) VALUES
('admin', 'admin@pong.com', '$2b$10$example_hash_here', '/avatars/admin.png'),
('player1', 'player1@example.com', '$2b$10$example_hash_here', '/avatars/player1.png'),
('player2', 'player2@example.com', '$2b$10$example_hash_here', '/avatars/player2.png'),
('pongmaster', 'master@pong.com', '$2b$10$example_hash_here', '/avatars/master.png');

INSERT INTO tournaments (name, description, max_participants, created_by) VALUES
('Tournoi de Printemps', 'Premier tournoi de la saison', 8, 1),
('Coupe des Champions', 'Tournoi réservé aux meilleurs joueurs', 16, 1);
