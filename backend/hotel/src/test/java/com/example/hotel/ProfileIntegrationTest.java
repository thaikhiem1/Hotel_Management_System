package com.example.hotel;

import com.example.hotel.Enums.Role;
import com.example.hotel.models.entities.accounts;
import com.example.hotel.models.entities.employees;
import com.example.hotel.repositorys.AccountRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * UC-EMP-003 (xem hồ sơ cá nhân) và UC-EMP-006 (cập nhật ảnh đại diện cá nhân).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProfileIntegrationTest {

    static final Path UPLOAD_DIR;

    static {
        try {
            UPLOAD_DIR = Files.createTempDirectory("avatar-test");
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    @DynamicPropertySource
    static void uploadDir(DynamicPropertyRegistry registry) {
        registry.add("app.upload.avatar-dir", UPLOAD_DIR::toString);
    }

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired AccountRepository accountRepository;
    @Autowired EmployeeRepository employeeRepository;
    @Autowired PasswordEncoder passwordEncoder;

    // ------------------------------------------------------------------ dữ liệu và tiện ích

    private employees createAccount(String username, String phone, String cccd, String email, Role role) {
        employees e = new employees();
        e.setFullName("Test " + username);
        e.setPosition("Lễ tân");
        e.setSalary(new BigDecimal("12345678"));
        e.setPhone(phone);
        e.setCitizenId(cccd);
        e.setDateOfBirth(LocalDate.of(2000, 1, 1));
        e.setGender("Nam");
        e.setEmail(email);
        e.setAvatar("/avatars/profileNam.jpg");
        e.setIsActive(true);
        e = employeeRepository.save(e);

        accounts a = new accounts();
        a.setUsername(username);
        a.setPasswordHash(passwordEncoder.encode("Pass@1234"));
        a.setRole(role);
        a.setEmployee(e);
        a.setIsActive(true);
        accountRepository.save(a);
        return e;
    }

    private String login(String username) throws Exception {
        String body = json.writeValueAsString(Map.of("username", username, "password", "Pass@1234"));
        String res = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(res).get("data").get("accessToken").asText();
    }

    private static byte[] image(String format) throws IOException {
        BufferedImage img = new BufferedImage(8, 8, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(img, format, out);
        return out.toByteArray();
    }

    private static byte[] webp() {
        byte[] b = new byte[64];
        System.arraycopy("RIFF".getBytes(StandardCharsets.US_ASCII), 0, b, 0, 4);
        System.arraycopy("WEBP".getBytes(StandardCharsets.US_ASCII), 0, b, 8, 4);
        return b;
    }

    private MockMultipartHttpServletRequestBuilder upload(String token, String name, byte[] content) {
        MockMultipartHttpServletRequestBuilder builder = multipart(org.springframework.http.HttpMethod.PUT, "/api/profile/avatar");
        builder.file(new MockMultipartFile("file", name, "application/octet-stream", content));
        if (token != null) {
            builder.header("Authorization", "Bearer " + token);
        }
        return builder;
    }

    private JsonNode data(org.springframework.test.web.servlet.ResultActions result) throws Exception {
        return json.readTree(result.andReturn().getResponse().getContentAsString()).get("data");
    }

    // ------------------------------------------------------------------ UC-EMP-003

    @Test
    void profile_requiresLogin() throws Exception {
        mvc.perform(get("/api/profile")).andExpect(status().isUnauthorized());
        mvc.perform(upload(null, "a.png", image("png"))).andExpect(status().isUnauthorized());
    }

    @Test
    void profile_returnsOwnInfoWithoutSalary_forEveryRole() throws Exception {
        for (Role role : Role.values()) {
            String user = "pf_" + role.name().toLowerCase();
            employees e = createAccount(user, "09" + role.ordinal() + "1000001", "0791000" + role.ordinal() + "01",
                    user + "@x.vn", role);

            JsonNode d = data(mvc.perform(get("/api/profile").header("Authorization", "Bearer " + login(user)))
                    .andExpect(status().isOk()));
            assertEquals(e.getEmployeeId(), d.get("employeeId").asInt());
            assertEquals("Test " + user, d.get("fullName").asText());
            assertEquals(user, d.get("username").asText());
            assertEquals(role.name(), d.get("role").asText());
            assertEquals("/avatars/profileNam.jpg", d.get("avatar").asText());
            assertFalse(d.has("salary"), "Hồ sơ cá nhân không được trả về lương");
        }
    }

    @Test
    void profile_ignoresEmployeeIdFromClient() throws Exception {
        createAccount("pf_a", "0911000001", "079100000001", "pf_a@x.vn", Role.RECEPTIONIST);
        employees other = createAccount("pf_b", "0911000002", "079100000002", "pf_b@x.vn", Role.RECEPTIONIST);

        JsonNode d = data(mvc.perform(get("/api/profile").param("employeeId", other.getEmployeeId().toString())
                        .header("Authorization", "Bearer " + login("pf_a")))
                .andExpect(status().isOk()));
        assertEquals("Test pf_a", d.get("fullName").asText());
    }

    // ------------------------------------------------------------------ UC-EMP-006

    @Test
    void uploadAvatar_acceptsAllowedFormats_andServesFileWithoutToken() throws Exception {
        createAccount("av_a", "0922000001", "079200000001", "av_a@x.vn", Role.RECEPTIONIST);
        String token = login("av_a");

        for (Map.Entry<String, byte[]> sample : Map.of(
                "me.png", image("png"), "me.jpg", image("jpg"), "me.JPEG", image("jpg"), "me.webp", webp()).entrySet()) {
            JsonNode d = data(mvc.perform(upload(token, sample.getKey(), sample.getValue()))
                    .andExpect(status().isOk()));
            String avatar = d.get("avatar").asText();
            assertTrue(avatar.startsWith("/uploads/avatars/"), avatar);
            assertTrue(Files.exists(UPLOAD_DIR.resolve(avatar.substring("/uploads/avatars/".length()))));
            mvc.perform(get(avatar)).andExpect(status().isOk());
        }
    }

    @Test
    void uploadAvatar_replacesOldUploadedFile_butKeepsDefaultAvatar() throws Exception {
        createAccount("av_b", "0922000002", "079200000002", "av_b@x.vn", Role.MANAGER);
        String token = login("av_b");

        String first = data(mvc.perform(upload(token, "a.png", image("png"))).andExpect(status().isOk()))
                .get("avatar").asText();
        String second = data(mvc.perform(upload(token, "b.png", image("png"))).andExpect(status().isOk()))
                .get("avatar").asText();

        assertFalse(first.equals(second));
        assertFalse(Files.exists(UPLOAD_DIR.resolve(first.substring("/uploads/avatars/".length()))));
        assertTrue(Files.exists(UPLOAD_DIR.resolve(second.substring("/uploads/avatars/".length()))));

        // hồ sơ trả về ảnh mới
        JsonNode profile = data(mvc.perform(get("/api/profile").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()));
        assertEquals(second, profile.get("avatar").asText());
    }

    @Test
    void uploadAvatar_onlyChangesTheCallersOwnAvatar() throws Exception {
        createAccount("av_c", "0922000003", "079200000003", "av_c@x.vn", Role.RECEPTIONIST);
        employees other = createAccount("av_d", "0922000004", "079200000004", "av_d@x.vn", Role.RECEPTIONIST);

        mvc.perform(upload(login("av_c"), "a.png", image("png")).param("employeeId", other.getEmployeeId().toString()))
                .andExpect(status().isOk());

        assertEquals("/avatars/profileNam.jpg", employeeRepository.findById(other.getEmployeeId()).orElseThrow().getAvatar());
    }

    @Test
    void uploadAvatar_rejectsInvalidFiles_andKeepsCurrentAvatar() throws Exception {
        employees e = createAccount("av_e", "0922000005", "079200000005", "av_e@x.vn", Role.RECEPTIONIST);
        String token = login("av_e");
        String message = "Ảnh đại diện không hợp lệ. Chỉ chấp nhận tệp JPG, JPEG, PNG hoặc WEBP, dung lượng tối đa 5 MB.";

        // nội dung không phải ảnh dù đuôi tệp hợp lệ
        mvc.perform(upload(token, "fake.png", "not an image".getBytes(StandardCharsets.UTF_8)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value(message));
        // ảnh PNG thật nhưng bị cắt cụt
        byte[] png = image("png");
        mvc.perform(upload(token, "cut.png", java.util.Arrays.copyOf(png, 20))).andExpect(status().isBadRequest());
        // đuôi tệp không được phép dù nội dung là ảnh
        mvc.perform(upload(token, "a.gif", png)).andExpect(status().isBadRequest());
        mvc.perform(upload(token, "a.exe", png)).andExpect(status().isBadRequest());
        // đuôi tệp không khớp nội dung thật
        mvc.perform(upload(token, "a.jpg", png)).andExpect(status().isBadRequest());
        // tệp rỗng
        mvc.perform(upload(token, "empty.png", new byte[0])).andExpect(status().isBadRequest());
        // vượt 5 MB
        byte[] big = new byte[5 * 1024 * 1024 + 1];
        System.arraycopy(png, 0, big, 0, png.length);
        mvc.perform(upload(token, "big.png", big)).andExpect(status().isBadRequest());
        // không đính kèm tệp
        mvc.perform(multipart(org.springframework.http.HttpMethod.PUT, "/api/profile/avatar")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());

        assertEquals("/avatars/profileNam.jpg", employeeRepository.findById(e.getEmployeeId()).orElseThrow().getAvatar());
    }
}
