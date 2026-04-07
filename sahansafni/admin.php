<?php
session_start();

// --- CONFIGURATION ---
// Set your desired password here
$adminPassword = "wedding2026"; 
// ---------------------

$isLoggedIn = isset($_SESSION['admin_auth']) && $_SESSION['admin_auth'] === true;

// Handle Login
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['loginPassword'])) {
    if ($_POST['loginPassword'] === $adminPassword) {
        $_SESSION['admin_auth'] = true;
        $isLoggedIn = true;
    } else {
        $error = "Incorrect password. Please try again.";
    }
}

// Handle Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: admin.php");
    exit;
}

$generatedLink = '';
$inviteeName = '';

// Handle Link Generation
if ($isLoggedIn && $_SERVER["REQUEST_METHOD"] == "POST" && !empty($_POST['inviteeName'])) {
    $inviteeName = htmlspecialchars(trim($_POST['inviteeName']), ENT_QUOTES, 'UTF-8');
    
    // Determine the base URL dynamically
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $dir = dirname($_SERVER['PHP_SELF']);
    $baseUrl = $protocol . "://" . $host . rtrim($dir, '/') . "/";
    
    $generatedLink = $baseUrl . "index.php?to=" . rawurlencode(trim($_POST['inviteeName']));
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sahan & Safni | Admin Panel</title>
    <link rel="stylesheet" href="style.css">
    <style>
        .admin-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            background: linear-gradient(135deg, #fdfaf5 0%, #f5e6d3 100%);
        }
        .logout-link {
            display: block;
            text-align: center;
            margin-top: 2rem;
            color: #888;
            text-decoration: none;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .logout-link:hover { color: var(--wine); }
    </style>
</head>
<body class="admin-wrapper">

    <div class="admin-panel" style="display: block; opacity: 1; transform: none;">
        <h2 class="admin-title">Admin Panel</h2>
        <p class="admin-sub">Sahan &amp; Safni Wedding</p>
        
        <?php if (!$isLoggedIn): ?>
            <!-- Login Form -->
            <form method="POST">
                <div class="form-group">
                    <label class="form-label">Admin Access Password</label>
                    <input type="password" name="loginPassword" placeholder="Enter password" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ddd;" required autofocus>
                </div>
                <?php if (isset($error)): ?>
                    <p style="color: #6b2d3e; font-size: 0.85rem; margin-top: -1rem; margin-bottom: 1rem; text-align: center;"><?php echo $error; ?></p>
                <?php endif; ?>
                <button type="submit" class="btn-admin">Login</button>
            </form>
        <?php else: ?>
            <!-- Generator Form -->
            <form method="POST">
                <div class="form-group">
                    <label class="form-label">Guest Name (for Invitation)</label>
                    <input type="text" name="inviteeName" placeholder="e.g. Mr. & Mrs. Perera" value="<?php echo $inviteeName; ?>" required>
                </div>
                <button type="submit" class="btn-admin">Generate Link</button>
            </form>

            <?php if (!empty($generatedLink)): ?>
            <div class="result-container active">
                <p class="result-label">Link generated for <strong style="color: var(--wine);"><?php echo $inviteeName; ?></strong>:</p>
                <div class="generated-link" id="generatedLinkText"><?php echo $generatedLink; ?></div>
                <button class="btn-admin" onclick="copyLink()">Copy Link</button>
                <p id="copyMessage" class="copy-success">Link Copied Successfully!</p>
            </div>
            <?php endif; ?>

            <a href="?logout=1" class="logout-link">Logout</a>
        <?php endif; ?>
    </div>

    <script src="script.js"></script>
</body>
</html>
