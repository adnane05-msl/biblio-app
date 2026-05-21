package com.biblio.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VerificationService {

    @Autowired
    private JavaMailSender mailSender;

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

            System.out.println("✅ Email envoyé à: " + email);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("❌ Erreur envoi: " + e.getMessage());
            return false;
        }
    }

    private void sendEmail(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("imranehamama@gmail.com");
        message.setTo(toEmail);
        message.setSubject("✅ Code de vérification - BiblioApp");
        message.setText("Bienvenue sur BiblioApp !\n\n" +
                "Votre code de vérification est : " + code + "\n\n" +
                "Ce code expire dans 15 minutes.\n\n" +
                "Cordialement,\n" +
                "L'équipe BiblioApp");

        mailSender.send(message);
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