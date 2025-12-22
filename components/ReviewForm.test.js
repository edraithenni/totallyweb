/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, act } from "@testing-library/react";
import ReviewForm from "./ReviewForm";

jest.useFakeTimers();

describe("ReviewForm component", () => {
  test("shows validation message when fields are empty", () => {
    render(<ReviewForm />);

    fireEvent.click(screen.getByText("Post Review"));

    expect(screen.getByText("Please fill out all fields.")).toBeInTheDocument();
  });

  test("submits the form and calls onSubmit with correct data", async () => {
    const mockSubmit = jest.fn();

    render(<ReviewForm onSubmit={mockSubmit} />);

    // Заполняем поля
    fireEvent.change(screen.getByPlaceholderText("Enter movie name"), {
      target: { value: "Avatar" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter rating"), {
      target: { value: "9" },
    });

    fireEvent.change(screen.getByPlaceholderText("Share your thoughts..."), {
      target: { value: "Amazing!" },
    });

    fireEvent.click(screen.getByText("Post Review"));

    // Сначала появляется статус "Sending..."
    expect(screen.getByText("Sending...")).toBeInTheDocument();

    // Прокручиваем таймеры (имитация 800мс)
    act(() => {
      jest.advanceTimersByTime(800);
    });

    // Потом появляется "Review submitted!"
    expect(screen.getByText("Review submitted!")).toBeInTheDocument();

    // Проверяем вызов onSubmit
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    const submitted = mockSubmit.mock.calls[0][0];

    // Проверяем данные
    expect(submitted.movie_title).toBe("Avatar");
    expect(submitted.rating).toBe(9);
    expect(submitted.content).toBe("Amazing!");
    expect(typeof submitted.created_at).toBe("string");

    // Поля должны очиститься
    expect(screen.getByPlaceholderText("Enter movie name").value).toBe("");
    expect(screen.getByPlaceholderText("Enter rating").value).toBe("");
    expect(screen.getByPlaceholderText("Share your thoughts...").value).toBe("");
  });

  test("status disappears after 2 seconds", () => {
    render(<ReviewForm />);

    fireEvent.change(screen.getByPlaceholderText("Enter movie name"), {
      target: { value: "Avatar" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter rating"), {
      target: { value: "8" },
    });

    fireEvent.change(screen.getByPlaceholderText("Share your thoughts..."), {
      target: { value: "Great!" },
    });

    fireEvent.click(screen.getByText("Post Review"));

    act(() => {
      jest.advanceTimersByTime(800); // показывается "Review submitted!"
    });

    expect(screen.getByText("Review submitted!")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000); // статус должен исчезнуть
    });

    expect(screen.queryByText("Review submitted!")).toBeNull();
  });
});
