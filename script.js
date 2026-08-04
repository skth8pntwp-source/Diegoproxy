import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.net.URI;

public class DiegoProxyApp extends JFrame {

    private final String[][] games = {
        {"Roblox (CloudMoon)", "https://web.cloudmoonapp.com/game/com.roblox.client/"},
        {"Roblox Web Portal", "https://www.roblox.com/discover"},
        {"Bloxd.io (Bedwars/Obby)", "https://bloxd.io/"},
        {"Kogama (Web Roblox Remake)", "https://www.kogama.com/"},
        {"Fortnite Cloud", "https://www.xbox.com/play/games/fortnite"},
        {"1v1.LOL", "https://1v1.lol/"},
        {"2048 Classic", "https://gabrielecirulli.github.io/2048/"},
        {"Hextris", "https://hextris.github.io/hextris/"},
        {"Flappy Bird", "https://ellisonleao.github.io/clumsy-bird/"},
        {"Pac-Man Classic", "https://macek.github.io/google_pacman/"},
        {"Canvas Tetris", "https://dionyziz.github.io/canvas-tetris/"},
        {"Cookie Clicker", "https://orteil.dashnet.org/cookieclicker/"},
        {"Browser Snake", "https://playsnake.org/"},
        {"Paper Minecraft", "https://scratch.mit.edu/projects/10128407/embed"},
        {"Geometry Dash (Scratch)", "https://scratch.mit.edu/projects/105500895/embed"}
    };

    public DiegoProxyApp() {
        setTitle("Diego Proxy 🌸 - Desktop Launcher");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        // Dark Theme Colors
        Color bgColor = new Color(15, 23, 42);
        Color cardBg = new Color(30, 41, 59);
        Color accentColor = new Color(236, 72, 153);

        getContentPane().setBackground(bgColor);
        setLayout(new BorderLayout(10, 10));

        // Header Panel
        JPanel headerPanel = new JPanel();
        headerPanel.setBackground(cardBg);
        JLabel titleLabel = new JLabel("Diego Proxy 🌸 Desktop Launcher");
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 22));
        titleLabel.setForeground(accentColor);
        headerPanel.add(titleLabel);
        add(headerPanel, BorderLayout.NORTH);

        // Grid Panel for Games
        JPanel gridPanel = new JPanel(new GridLayout(0, 3, 10, 10));
        gridPanel.setBackground(bgColor);
        gridPanel.setBorder(BorderFactory.createEmptyBorder(15, 15, 15, 15));

        for (String[] game : games) {
            JButton btn = new JButton(game[0]);
            btn.setFont(new Font("Segoe UI", Font.BOLD, 14));
            btn.setBackground(cardBg);
            btn.setForeground(Color.WHITE);
            btn.setFocusPainted(false);
            btn.setBorder(BorderFactory.createLineBorder(accentColor, 1));
            
            btn.addActionListener((ActionEvent e) -> openWebpage(game[1]));
            gridPanel.add(btn);
        }

        JScrollPane scrollPane = new JScrollPane(gridPanel);
        scrollPane.setBorder(null);
        add(scrollPane, BorderLayout.CENTER);
    }

    private void openWebpage(String urlString) {
        try {
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSER)) {
                Desktop.getDesktop().browse(new URI(urlString));
            } else {
                JOptionPane.showMessageDialog(this, "Opening URL: " + urlString);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            DiegoProxyApp app = new DiegoProxyApp();
            app.setVisible(true);
        });
    }
}
