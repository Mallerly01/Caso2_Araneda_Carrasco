package cl.caso2.AranedaCarrasco.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        String error,
        Map<String, String> campos
) {
    public ErrorResponse(String error) {
        this(error, null);
    }
}
