// server.js - Serveur principal Fastify
const fastify = require('fastify')({
  logger: true,
  cors: {
    origin: true,
    credentials: true
  }
});

const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './data/pong.db';

// Initialisation de la base de données
const db = new Database(DB_PATH);

// Middleware d'authentification JWT
fastify.register(require('@fastify/jwt'), {
  secret: JWT_SECRET
});

fastify.register(require('@fastify/cors'), {
  origin: true, //Ici mettre le domaine de l'application front-end
  credentials: true
});

// Route d'accueil
fastify.get('/', async (request, reply) => {
  return {
    message: 'Bienvenue sur l’API ft_transcendence (Fastify)!',
    endpoints: [
      '/health',
      '/api/users',
      '/api/matches',
      '/api/tournaments',
      '/api/dbdump',
    ]
  };
});

// Route de health check
fastify.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString()
  };
});

// --- ROUTE DEBUG : DUMP COMPLET DE LA DB ---
fastify.get('/api/dbdump', async (request, reply) => {
  try {
    const tables = [
      'users', 'matches', 'tournaments', 'tournament_participants',
      'friendships', 'messages'
    ];
    const dump = {};
    for (const table of tables) {
      try {
        dump[table] = db.prepare(`SELECT * FROM ${table}`).all();
      } catch (err) {
        dump[table] = { error: 'Table not found or error reading' };
      }
    }
    return dump;
  } catch (err) {
    reply.code(500).send({ error: 'Erreur lors du dump DB', details: err.message });
  }
});

// --- ROUTES API SIMPLES ---

// Liste des utilisateurs
fastify.get('/api/users', async (request, reply) => {
  try {
    const users = db.prepare('SELECT id, username, email, avatar_url, wins, losses, total_games, elo_rating, created_at FROM users').all();
    return users;
  } catch (err) {
    reply.code(500).send({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Liste des matchs
fastify.get('/api/matches', async (request, reply) => {
  try {
    const matches = db.prepare(`
      SELECT m.id, m.player1_id, m.player2_id, m.player1_score, m.player2_score, m.winner_id, m.status, m.created_at, m.finished_at,
        u1.username as player1_username, u2.username as player2_username
      FROM matches m
      LEFT JOIN users u1 ON m.player1_id = u1.id
      LEFT JOIN users u2 ON m.player2_id = u2.id
      ORDER BY m.created_at DESC
    `).all();
    return matches;
  } catch (err) {
    reply.code(500).send({ error: 'Erreur lors de la récupération des matchs' });
  }
});

// Décorateur pour l'authentification
fastify.decorate('authenticate', async function(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Routes d'authentification
fastify.register(async function (fastify) {
  // Inscription
  fastify.post('/api/auth/register', async (request, reply) => {
    const { username, email, password } = request.body;

    if (!username || !email || !password) {
      return reply.code(400).send({ error: 'Tous les champs sont requis' });
    }

    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
      if (existingUser) {
        return reply.code(409).send({ error: 'Nom d\'utilisateur ou email déjà utilisé' });
      }

      // Hasher le mot de passe
      const passwordHash = await bcrypt.hash(password, 10);

      // Créer l'utilisateur
      const stmt = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
      const result = stmt.run(username, email, passwordHash);

      const token = fastify.jwt.sign({ id: result.lastInsertRowid, username });

      reply.send({
        token,
        user: { id: result.lastInsertRowid, username, email }
      });
    } catch (error) {
      reply.code(500).send({ error: 'Erreur lors de la création du compte' });
    }
  });

  // Connexion
  fastify.post('/api/auth/login', async (request, reply) => {
    const { username, password } = request.body;
    console.log('--- Tentative de connexion ---');
    console.log('Données reçues:', { username, password });

    if (!username || !password) {
      console.log('Champs manquants');
      return reply.code(400).send({ error: "Nom d'utilisateur et mot de passe requis" });
    }

    try {
      const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);
      console.log('Utilisateur trouvé en DB:', user);

      if (!user) {
        console.log('Aucun utilisateur correspondant');
        return reply.code(401).send({ error: 'Identifiants invalides' });
      }

      // Test manuel de comparaison bcrypt
      const bcryptTest = await bcrypt.compare(password, user.password_hash);
      console.log('Résultat comparaison bcrypt:', bcryptTest);
      if (!bcryptTest) {
        console.log('Mot de passe invalide');
        return reply.code(401).send({ error: 'Identifiants invalides' });
      }

      const token = fastify.jwt.sign({ id: user.id, username: user.username });
      console.log('Connexion réussie, token généré');

      reply.send({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          wins: user.wins,
          losses: user.losses,
          elo_rating: user.elo_rating
        }
      });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      reply.code(500).send({ error: 'Erreur lors de la connexion' });
    }
  });

  // Profil utilisateur
  fastify.get('/api/auth/profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const user = db.prepare(`
        SELECT id, username, email, wins, losses, total_games, elo_rating, created_at, avatar_url
        FROM users WHERE id = ?
      `).get(request.user.id);

      if (!user) {
        return reply.code(404).send({ error: 'Utilisateur non trouvé' });
      }

      reply.send({ user });
    } catch (error) {
      reply.code(500).send({ error: 'Erreur lors de la récupération du profil' });
    }
  });
});

// Routes pour les matchs
fastify.register(async function (fastify) {
  // Créer un nouveau match
  fastify.post('/api/matches', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { opponent_id, tournament_id } = request.body;

    if (!opponent_id) {
      return reply.code(400).send({ error: 'ID de l\'adversaire requis' });
    }

    try {
      const stmt = db.prepare(`
        INSERT INTO matches (player1_id, player2_id, tournament_id, status)
        VALUES (?, ?, ?, 'pending')
      `);
      const result = stmt.run(request.user.id, opponent_id, tournament_id || null);

      const match = db.prepare(`
        SELECT m.*, u1.username as player1_name, u2.username as player2_name
        FROM matches m
        JOIN users u1 ON m.player1_id = u1.id
        JOIN users u2 ON m.player2_id = u2.id
        WHERE m.id = ?
      `).get(result.lastInsertRowid);

      reply.send({ match });
    } catch (error) {
      reply.code(500).send({ error: 'Erreur lors de la création du match' });
    }
  });

  // Démarrer un match
  fastify.post('/api/matches/:id/start', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const matchId = request.params.id;

    try {
      const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);

      if (!match) {
        return reply.code(404).send({ error: 'Match non trouvé' });
      }

      if (match.player1_id !== request.user.id && match.player2_id !== request.user.id) {
        return reply.code(403).send({ error: 'Vous n\'êtes pas autorisé à démarrer ce match' });
      }

      db.prepare(`
        UPDATE matches SET status = 'in_progress', started_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(matchId);

      // Créer une session de jeu
      db.prepare(`
        INSERT INTO game_sessions (match_id, session_data, is_active)
        VALUES (?, '{}', 1)
      `).run(matchId);

      reply.send({ message: 'Match démarré avec succès' });
    } catch (error) {
      reply.code(500).send({ error: 'Erreur lors du démarrage du match' });
    }
  });

  // Terminer un match avec score
  fastify.post('/api/matches/:id/finish', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const matchId = request.params.id;
    const { player1_score, player2_score, duration_seconds } = request.body;

    try {
      const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);

      if (!match) {
        return reply.code(404).send({ error: 'Match non trouvé' });
      }

      if (match.player1_id !== request.user.id && match.player2_id !== request.user.id) {
        return reply.code(403).send({ error: 'Vous n\'êtes pas autorisé à terminer ce match' });
      }

      const winner_id = player1_score > player2_score ? match.player1_id : match.player2_id;

      db.prepare(`
        UPDATE matches SET
          player1_score = ?, player2_score = ?, winner_id = ?,
          status = 'completed', finished_at = CURRENT_TIMESTAMP, duration_seconds = ?
        WHERE id = ?
      `).run(player1_score, player2_score, winner_id, duration_seconds, matchId);



      reply.send({ message: 'Match terminé avec succès', winner_id });
    } catch (error) {
      reply.code(500).send({ error: 'Erreur lors de la fin du match' });
    }
  });

  // Obtenir l'historique des matchs d'un utilisateur
  fastify.get('/api/matches/history', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const matches = db.prepare(`
        SELECT m.*, u1.username as player1_name, u2.username as player2_name,
               CASE WHEN m.winner_id = ? THEN 'won' ELSE 'lost' END as result
        FROM matches m
        JOIN users u1 ON m.player1_id = u1.id
        JOIN users u2 ON m.player2_id = u2.id
        WHERE (m.player1_id = ? OR m.player2_id = ?) AND m.status = 'completed'
        ORDER BY m.finished_at DESC
        LIMIT 20
      `).all(request.user.id, request.user.id, request.user.id);

      reply.send({ matches });
    } catch (error) {
      reply.code(500).send({ error: 'Erreur lors de la récupération de l\'historique' });
    }
  });
});

// Routes pour les tournois
fastify.register(async function (fastify) {
  // Créer un tournoi
  fastify.post('/api/tournaments', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { name, description, max_participants, registration_end, start_date } = request.body;

    if (!name) {
      return reply.code(400).send({ error: 'Nom du tournoi requis' });
    }

    try {
      const stmt = db.prepare(`
        INSERT INTO tournaments (name, description, max_participants, registration_end, start_date, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        name, description || '', max_participants || 8,
        registration_end, start_date, request.user.id
      );

      const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(result.lastInsertRowid);
      reply.send({ tournament });
    } catch (error) {
      reply.code(500).send({ error: 'Erreur lors de la création du tournoi' });
    }
  });

  // Lister les tournois
  fastify.get('/api/tournaments', async (request, reply) => {
    const { status = 'registration' } = request.query;

    try {
      const tournaments = db.prepare(`
        SELECT t.id, t.name, t.description, t.max_participants, t.current_participants, t.status, t.registration_start, t.registration_end, t.start_date, t.end_date, t.winner_id, t.created_by, t.created_at, u.username as creator_name,
               (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = t.id) as participants_count
        FROM tournaments t
        JOIN users u ON t.created_by = u.id
        WHERE t.status = ?
        ORDER BY t.created_at DESC
      `).all(status);

      reply.send({ tournaments });
    } catch (error) {
      reply.code(500).send({ error: 'Erreur lors de la récupération des tournois' });
    }
  });

  // S'inscrire à un tournoi
  fastify.post('/api/tournaments/:id/join', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const tournamentId = request.params.id;

    try {
      const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId);

      if (!tournament) {
        return reply.code(404).send({ error: 'Tournoi non trouvé' });
      }

      if (tournament.status !== 'registration') {
        return reply.code(400).send({ error: 'Les inscriptions sont fermées' });
      }

      if (tournament.current_participants >= tournament.max_participants) {
        return reply.code(400).send({ error: 'Tournoi complet' });
      }

      // Vérifier si déjà inscrit
      const existing = db.prepare('SELECT id FROM tournament_participants WHERE tournament_id = ? AND user_id = ?')
        .get(tournamentId, request.user.id);

      if (existing) {
        return reply.code(409).send({ error: 'Déjà inscrit à ce tournoi' });
      }

      db.prepare('INSERT INTO tournament_participants (tournament_id, user_id) VALUES (?, ?)')
        .run(tournamentId, request.user.id);

      reply.send({ message: 'Inscription réussie au tournoi' });
    } catch (error) {
      reply.code(500).send({ error: 'Erreur lors de l\'inscription au tournoi' });
    }
  });

  // Obtenir les détails d'un tournoi avec participants
  fastify.get('/api/tournaments/:id', async (request, reply) => {
    const tournamentId = request.params.id;

    try {
      const tournament = db.prepare(`
        SELECT t.id, t.name, t.description, t.max_participants, t.current_participants, t.status, t.registration_start, t.registration_end, t.start_date, t.end_date, t.winner_id, t.created_by, t.created_at, u.username as creator_name
        FROM tournaments t
        JOIN users u ON t.created_by = u.id
        WHERE t.id = ?
      `).get(tournamentId);

      if (!tournament) {
        return reply.code(404).send({ error: 'Tournoi non trouvé' });
      }

      const participants = db.prepare(`
        SELECT tp.*, u.username, u.elo_rating
        FROM tournament_participants tp
        JOIN users u ON tp.user_id = u.id
        WHERE tp.tournament_id = ?
        ORDER BY tp.registration_date ASC
      `).all(tournamentId);

      const matches = db.prepare(`
        SELECT m.*, u1.username as player1_name, u2.username as player2_name
        FROM matches m
        JOIN users u1 ON m.player1_id = u1.id
        JOIN users u2 ON m.player2_id = u2.id
        WHERE m.tournament_id = ?
        ORDER BY m.created_at ASC
      `).all(tournamentId);

      reply.send({ tournament, participants, matches });
    } catch (error) {
      reply.code(500).send({ error: 'Erreur lors de la récupération du tournoi' });
    }
  });
});

// Route WebSocket pour le jeu en temps réel
fastify.register(async function (fastify) {
  await fastify.register(require('@fastify/websocket'));

  fastify.register(async function (fastify) {
    fastify.get('/api/game/:matchId', { websocket: true }, (connection, req) => {
      const matchId = req.params.matchId;

      connection.socket.on('message', message => {
        try {
          const data = JSON.parse(message);

          // Gérer les différents types de messages du jeu
          switch (data.type) {
            case 'paddle_move':
              // Relayer le mouvement de paddle à l'autre joueur
              // Implementation WebSocket game logic here
              break;
            case 'ball_update':
              // Mettre à jour la position de la balle
              break;
            case 'game_state':
              // Synchroniser l'état du jeu
              break;
          }



        } catch (error) {
          console.error('Erreur WebSocket:', error);
        }
      });

      connection.socket.on('close', () => {
        console.log('Connexion WebSocket fermée pour le match:', matchId);
      });
    });
  });
});

// Initialisation de la base de données au démarrage
function initializeDatabase() {
  try {
    // Vérifier si les tables existent, sinon les créer
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();

    if (!tableExists) {
      console.log('Initialisation de la base de données...');
      const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      db.exec(schema);
      console.log('Base de données initialisée avec succès');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

// Route de test
fastify.get('/api/health', async (request, reply) => {
  reply.send({ status: 'OK', timestamp: new Date().toISOString() });
});

// Démarrage du serveur
const start = async () => {
  try {
    initializeDatabase();
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Serveur démarré sur le port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
