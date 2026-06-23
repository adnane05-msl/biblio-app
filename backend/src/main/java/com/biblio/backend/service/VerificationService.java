package com.biblio.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VerificationService {

    private final ConcurrentHashMap<String, VerificationCodeData> verificationCodes = new ConcurrentHashMap<>();

    private String generateCode() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }

    public boolean sendVerificationCode(String email) {
        try {
            String code = generateCode();
            verificationCodes.put(email, new VerificationCodeData(code, System.currentTimeMillis() + 15 * 60 * 1000));

            sendEmail(email, code);

            System.out.println("Email envoyé à: " + email);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Erreur envoi: " + e.getMessage());
            return false;
        }
    }

    private void sendEmail(String toEmail, String code) throws Exception {
        String apiKey = System.getenv("BREVO_API_KEY");

        String textContent = "Bienvenue sur BiblioApp !\\n\\n" +
                "Votre code de verification est : " + code + "\\n\\n" +
                "Ce code expire dans 15 minutes.\\n\\n" +
                "Cordialement,\\nL'equipe BiblioApp";

        String body = "{"
                + "\"sender\":{\"name\":\"BiblioApp\",\"email\":\"biblioapp.support@gmail.com\"},"
                + "\"to\":[{\"email\":\"" + toEmail + "\"}],"
                + "\"subject\":\"Code de verification - BiblioApp\","
                + "\"textContent\":\"" + textContent + "\""
                + "}";

        java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
        java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create("https://api.brevo.com/v3/smtp/email"))
                .header("api-key", apiKey)
                .header("Content-Type", "application/json")
                .header("accept", "application/json")
                .POST(java.net.http.HttpRequest.BodyPublishers.ofString(body))
                .build();

        java.net.http.HttpResponse<String> response =
                client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());

        System.out.println("Brevo response: " + response.statusCode() + " " + response.body());

        if (response.statusCode() >= 300) {
            throw new RuntimeException("Brevo error: " + response.statusCode() + " " + response.body());
        }
    }

    public boolean verifyCode(String email, String userCode) {
        VerificationCodeData stored = verificationCodes.get(email);
        if (stored == null) return false;
        if (System.currentTimeMillis() > stored.expirationTime) {
            verificationCodes.remove(email);
            return false;
        }
        if (stored.code.equals(userCode)) {
            verificationCodes.remove(email);
            return true;
        }
        return false;
    }

    public boolean isEmailVerified(String email) {
        return !verificationCodes.containsKey(email);
    }

    public void clearVerificationCode(String email) {
        verificationCodes.remove(email);
    }

    private static class VerificationCodeData {
        String code;
        long expirationTime;
        VerificationCodeData(String code, long expirationTime) {
            this.code = code;
            this.expirationTime = expirationTime;
        }
    }
}